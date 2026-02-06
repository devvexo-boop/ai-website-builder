import { RefreshCcw, Sparkles } from 'lucide-react';

export default function PromptBar({
  prompt,
  setPrompt,
  projectName,
  setProjectName,
  mode,
  setMode,
  loading,
  onGenerate,
  onRegenerate
}) {
  return (
    <section className="prompt-panel glass-panel">
      <div className="prompt-top-row">
        <input
          className="name-input"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project name"
          maxLength={80}
        />
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option value="single-page">Single-page</option>
          <option value="multi-page">Multi-page</option>
        </select>
      </div>
      <textarea
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe the website you want..."
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
