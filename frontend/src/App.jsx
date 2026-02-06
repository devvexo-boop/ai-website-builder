import { useEffect, useMemo, useState } from 'react';
import JSZip from 'jszip';
import { Moon, Sun, FolderTree } from 'lucide-react';
import PromptBar from './components/PromptBar';
import SidebarHistory from './components/SidebarHistory';
import EditorPane from './components/EditorPane';
import { loadProjects, saveProjects } from './utils/projectStorage';

const DEFAULT_FILES = {
  'index.html': '<!doctype html>\n<html><head><title>AI Site</title><link rel="stylesheet" href="styles.css"></head><body><h1>Start building</h1><script src="script.js"></script></body></html>',
  'styles.css': 'body { font-family: Inter, sans-serif; background: #09090f; color: #fff; margin: 0; min-height: 100vh; display: grid; place-items: center; }',
  'script.js': 'console.log("AI Website Builder ready");'
};

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001';

export default function App() {
  const [prompt, setPrompt] = useState('Create a dark gaming portfolio website with animations');
  const [projectName, setProjectName] = useState('My AI Project');
  const [files, setFiles] = useState(DEFAULT_FILES);
  const [activeFile, setActiveFile] = useState('index.html');
  const [projects, setProjects] = useState(loadProjects());
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('dark');

  const previewSrcDoc = useMemo(
    () => `${files['index.html'] || ''}\n<style>${files['styles.css'] || ''}</style>\n<script>${files['script.js'] || ''}<' + '/script>'`,
    [files]
  );

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  useEffect(() => {
    document.body.dataset.theme = theme;
  }, [theme]);

  const persistProject = (nextFiles, usedPrompt = prompt) => {
    const id = selectedId ?? crypto.randomUUID();
    const next = {
      id,
      name: projectName.trim() || 'Untitled Project',
      prompt: usedPrompt,
      files: nextFiles,
      updatedAt: new Date().toISOString()
    };

    setSelectedId(id);
    setProjects((prev) => [next, ...prev.filter((project) => project.id !== id)].slice(0, 20));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Generation failed');
      }

      const nextFiles = {
        'index.html': data.html,
        'styles.css': data.css,
        'script.js': data.js
      };
      setFiles(nextFiles);
      persistProject(nextFiles, prompt);
    } catch (fetchError) {
      setError(fetchError.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectProject = (id) => {
    const selected = projects.find((project) => project.id === id);
    if (!selected) return;
    setSelectedId(id);
    setProjectName(selected.name);
    setPrompt(selected.prompt || '');
    setFiles(selected.files);
  };

  const handleFileChange = (file, value) => {
    const next = { ...files, [file]: value };
    setFiles(next);
    persistProject(next);
  };

  const handleCopy = async (file) => {
    await navigator.clipboard.writeText(files[file] || '');
  };

  const handleZip = async () => {
    const zip = new JSZip();
    Object.entries(files).forEach(([name, content]) => zip.file(name, content));
    const blob = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${projectName || 'project'}.zip`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="app-shell">
      <SidebarHistory projects={projects} selectedId={selectedId} onSelect={handleSelectProject} />
      <main>
        <header className="top-bar glass-panel">
          <h1>NeonForge AI Builder</h1>
          <div className="top-actions">
            <span className="chip"><FolderTree size={14} /> Multi-file project</span>
            <button className="ghost" onClick={() => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))}>
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />} {theme}
            </button>
          </div>
        </header>

        <PromptBar
          prompt={prompt}
          setPrompt={setPrompt}
          projectName={projectName}
          setProjectName={setProjectName}
          onGenerate={handleGenerate}
          onRegenerate={handleGenerate}
          loading={loading}
        />

        {error && <p className="error-text">{error}</p>}

        <section className="workspace-grid">
          <EditorPane
            files={files}
            activeFile={activeFile}
            setActiveFile={setActiveFile}
            onFileChange={handleFileChange}
            onCopy={handleCopy}
            onZip={handleZip}
            theme={theme}
          />

          <section className="preview-panel glass-panel">
            <h3>Live Preview</h3>
            {loading && <div className="loader">Generating futuristic website...</div>}
            <iframe title="preview" srcDoc={previewSrcDoc} sandbox="allow-scripts allow-modals" />
          </section>
        </section>
      </main>
    </div>
  );
}
