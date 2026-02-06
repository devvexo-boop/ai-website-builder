import { useEffect, useMemo, useState } from 'react';
import JSZip from 'jszip';
import { FolderTree, Moon, Sun } from 'lucide-react';
import SidebarHistory from './components/SidebarHistory';
import PromptBar from './components/PromptBar';
import EditorPane from './components/EditorPane';
import { createDefaultProject, loadProjects, saveProjects } from './utils/projectStorage';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

const buildPreviewDocument = (files) => {
  const html = files['index.html'] || '<main>Missing index.html</main>';
  const css = files['styles.css'] || '';
  const js = files['script.js'] || '';
  return `${html}\n<style>${css}</style>\n<script>${js}<\/script>`;
};

export default function App() {
  const loaded = loadProjects();
  const initialProject = loaded[0] || createDefaultProject();

  const [projects, setProjects] = useState(loaded.length ? loaded : [initialProject]);
  const [selectedId, setSelectedId] = useState(initialProject.id);
  const [projectName, setProjectName] = useState(initialProject.name);
  const [prompt, setPrompt] = useState(initialProject.prompt);
  const [mode, setMode] = useState(initialProject.mode || 'single-page');
  const [files, setFiles] = useState(initialProject.files);
  const [activeFile, setActiveFile] = useState(Object.keys(initialProject.files)[0]);
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const previewSrcDoc = useMemo(() => buildPreviewDocument(files), [files]);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const persistCurrentProject = (next) => {
    setProjects((prev) => {
      const updated = {
        id: selectedId,
        name: next.name,
        prompt: next.prompt,
        mode: next.mode,
        files: next.files,
        createdAt: prev.find((item) => item.id === selectedId)?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      return [updated, ...prev.filter((item) => item.id !== selectedId)].slice(0, 30);
    });
  };

  const applyProject = (project) => {
    setSelectedId(project.id);
    setProjectName(project.name);
    setPrompt(project.prompt);
    setMode(project.mode || 'single-page');
    setFiles(project.files);
    setActiveFile(Object.keys(project.files)[0] || 'index.html');
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, projectName, mode })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Generation failed');

      const nextFiles = data.files || {
        'index.html': data.html,
        'styles.css': data.css,
        'script.js': data.js
      };

      setFiles(nextFiles);
      setProjectName(data.projectName || projectName);
      setActiveFile(Object.keys(nextFiles)[0] || 'index.html');
      persistCurrentProject({ name: data.projectName || projectName, prompt, mode, files: nextFiles });
    } catch (err) {
      setError(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (name, value) => {
    const next = { ...files, [name]: value };
    setFiles(next);
    persistCurrentProject({ name: projectName, prompt, mode, files: next });
  };

  const handleAddFile = () => {
    const filename = window.prompt('Enter file name (e.g. about.html)');
    if (!filename) return;
    const clean = filename.replace(/\.\./g, '').replace(/^\/+/, '').trim();
    if (!clean || files[clean]) return;
    const next = { ...files, [clean]: '' };
    setFiles(next);
    setActiveFile(clean);
    persistCurrentProject({ name: projectName, prompt, mode, files: next });
  };

  const handleDeleteFile = (name) => {
    if (!files[name] || Object.keys(files).length <= 1) return;
    const next = { ...files };
    delete next[name];
    setFiles(next);
    setActiveFile(Object.keys(next)[0]);
    persistCurrentProject({ name: projectName, prompt, mode, files: next });
  };

  const handleCopy = async (name) => {
    await navigator.clipboard.writeText(files[name] || '');
  };

  const handleDownloadZip = async () => {
    const zip = new JSZip();
    Object.entries(files).forEach(([name, content]) => zip.file(name, content));
    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${projectName || 'project'}.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSelectProject = (id) => {
    const target = projects.find((p) => p.id === id);
    if (!target) return;
    applyProject(target);
  };

  const handleNewProject = () => {
    const created = createDefaultProject();
    const merged = [created, ...projects].slice(0, 30);
    setProjects(merged);
    applyProject(created);
  };

  return (
    <div className="app-shell">
      <SidebarHistory
        projects={projects}
        selectedId={selectedId}
        onSelect={handleSelectProject}
        onNewProject={handleNewProject}
      />

      <main>
        <header className="top-bar glass-panel">
          <h1>NeonForge AI Website Builder</h1>
          <div className="top-actions">
            <span className="chip"><FolderTree size={14} /> File tree + tabs</span>
            <button className="ghost" onClick={() => setTheme((v) => (v === 'dark' ? 'light' : 'dark'))}>
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />} {theme}
            </button>
          </div>
        </header>

        <PromptBar
          prompt={prompt}
          setPrompt={setPrompt}
          projectName={projectName}
          setProjectName={setProjectName}
          mode={mode}
          setMode={setMode}
          loading={loading}
          onGenerate={handleGenerate}
          onRegenerate={handleGenerate}
        />

        {error ? <p className="error-text">{error}</p> : null}

        <section className="workspace-grid">
          <EditorPane
            files={files}
            activeFile={activeFile}
            onSelectFile={setActiveFile}
            onFileChange={handleFileChange}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
            onCopy={handleCopy}
            onZip={handleDownloadZip}
            theme={theme}
          />

          <section className="preview-panel glass-panel">
            <h3>Live Preview</h3>
            {loading ? <div className="loader">Generating production-ready code...</div> : null}
            <iframe title="preview" srcDoc={previewSrcDoc} sandbox="allow-scripts allow-modals allow-forms" />
          </section>
        </section>
      </main>
    </div>
  );
}
