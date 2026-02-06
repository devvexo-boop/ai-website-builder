import Editor from '@monaco-editor/react';
import { Copy, Download, Plus, Trash2 } from 'lucide-react';

const getLanguage = (name) => {
  if (name.endsWith('.html')) return 'html';
  if (name.endsWith('.css')) return 'css';
  if (name.endsWith('.js')) return 'javascript';
  if (name.endsWith('.json')) return 'json';
  return 'plaintext';
};

export default function EditorPane({
  files,
  activeFile,
  onSelectFile,
  onFileChange,
  onAddFile,
  onDeleteFile,
  onCopy,
  onZip,
  theme
}) {
  const names = Object.keys(files);

  return (
    <section className="editor-panel glass-panel">
      <div className="editor-head">
        <div className="file-tree">
          {names.map((name) => (
            <button key={name} className={`file-tab ${name === activeFile ? 'active' : ''}`} onClick={() => onSelectFile(name)}>
              {name}
            </button>
          ))}
        </div>
        <button className="ghost" onClick={onAddFile}><Plus size={14} /> New file</button>
      </div>

      <div className="editor-toolbar">
        <span>{activeFile}</span>
        <div>
          <button className="ghost" onClick={() => onCopy(activeFile)}><Copy size={14} /> Copy</button>
          <button className="ghost" onClick={() => onDeleteFile(activeFile)} disabled={names.length <= 1}><Trash2 size={14} /> Delete</button>
          <button className="ghost" onClick={onZip}><Download size={14} /> Download ZIP</button>
        </div>
      </div>

      <Editor
        height="420px"
        language={getLanguage(activeFile)}
        value={files[activeFile] ?? ''}
        onChange={(value) => onFileChange(activeFile, value || '')}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={{
          minimap: { enabled: true },
          fontSize: 14,
          smoothScrolling: true,
          wordWrap: 'on'
        }}
      />
    </section>
  );
}
