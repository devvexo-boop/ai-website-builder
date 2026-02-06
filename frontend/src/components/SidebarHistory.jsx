import { Clock3 } from 'lucide-react';

export default function SidebarHistory({ projects, selectedId, onSelect }) {
  return (
    <aside className="history-sidebar glass-panel">
      <h2><Clock3 size={16} /> History</h2>
      <div className="history-list">
        {projects.length === 0 ? (
          <p className="empty-text">No projects yet.</p>
        ) : (
          projects.map((project) => (
            <button
              key={project.id}
              className={`history-item ${selectedId === project.id ? 'active' : ''}`}
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
