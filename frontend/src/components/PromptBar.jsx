import { Sparkles, RefreshCcw } from 'lucide-react';

export default function PromptBar({
  prompt,
  setPrompt,
  projectName,
  setProjectName,
  onGenerate,
  onRegenerate,
  loading
}) {
  return (
    <section className="prompt-panel glass-panel">
      <input
        className="name-input"
        value={projectName}
        onChange={(event) => setProjectName(event.target.value)}
        placeholder="Project name"
        maxLength={60}
      />
      <textarea
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        placeholder="Describe the website to generate..."
        maxLength={2000}
      />
      <div className="prompt-actions">
        <button className="primary" onClick={onGenerate} disabled={loading || !prompt.trim()}>
          <Sparkles size={16} /> {loading ? 'Generating...' : 'Generate'}
        </button>
        <button className="ghost" onClick={onRegenerate} disabled={loading || !prompt.trim()}>
          <RefreshCcw size={16} /> Regenerate
        </button>
      </div>
    </section>
  );
}
