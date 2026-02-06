import Editor from '@monaco-editor/react';
import { Copy, Download } from 'lucide-react';

const LANGUAGE_MAP = {
  'index.html': 'html',
  'styles.css': 'css',
  'script.js': 'javascript'
};

export default function EditorPane({ files, activeFile, setActiveFile, onFileChange, onCopy, onZip, theme }) {
  const currentCode = files[activeFile] || '';

  return (
    <section className="editor-panel glass-panel">
      <div className="file-tree">
        {Object.keys(files).map((file) => (
          <button
            key={file}
            className={`file-tab ${file === activeFile ? 'active' : ''}`}
            onClick={() => setActiveFile(file)}
          >
            {file}
          </button>
        ))}
      </div>
      <div className="editor-toolbar">
        <span>{activeFile}</span>
        <div>
          <button className="ghost" onClick={() => onCopy(activeFile)}><Copy size={14} /> Copy</button>
          <button className="ghost" onClick={onZip}><Download size={14} /> ZIP</button>
        </div>
      </div>
      <Editor
        height="360px"
        language={LANGUAGE_MAP[activeFile] || 'plaintext'}
        value={currentCode}
        onChange={(value) => onFileChange(activeFile, value || '')}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={{ minimap: { enabled: false }, fontSize: 14, smoothScrolling: true }}
      />
    </section>
  );
}
