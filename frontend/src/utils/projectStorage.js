const STORAGE_KEY = 'neonforge-projects-v2';

export function loadProjects() {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && item.id && item.files && typeof item.files === 'object');
  } catch {
    return [];
  }
}

export function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.slice(0, 30)));
}

export function createDefaultProject() {
  return {
    id: crypto.randomUUID(),
    name: 'Untitled Project',
    prompt: 'Create a dark gaming portfolio website with animations',
    mode: 'single-page',
    files: {
      'index.html': '<!doctype html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>AI Website</title>\n  <link rel="stylesheet" href="styles.css" />\n</head>\n<body>\n  <main>\n    <h1>NeonForge</h1>\n    <p>Describe a site and generate instantly.</p>\n  </main>\n  <script src="script.js"></script>\n</body>\n</html>',
      'styles.css': 'body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #070b17; color: #fff; font-family: Inter, system-ui, sans-serif; }',
      'script.js': 'console.log("Ready.");'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
