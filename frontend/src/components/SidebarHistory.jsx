import { Clock3 } from 'lucide-react';

export default function SidebarHistory({ projects, selectedId, onSelect, onNewProject }) {
  return (
    <aside className="history-sidebar glass-panel">
      <div className="history-header">
        <h2><Clock3 size={16} /> Projects</h2>
        <button className="ghost" onClick={onNewProject}>New</button>
      </div>

      <div className="history-list">
        {projects.length === 0 ? (
          <p className="empty-text">No saved projects.</p>
        ) : (
          projects.map((project) => (
            <button
              key={project.id}
              className={`history-item ${project.id === selectedId ? 'active' : ''}`}
              onClick={() => onSelect(project.id)}
            >
              <span className="history-name">{project.name}</span>
              <span className="history-time">{new Date(project.updatedAt).toLocaleString()}</span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
