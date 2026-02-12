const messages = document.getElementById('messages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const newChatBtn = document.getElementById('newChatBtn');
const plusBtn = document.getElementById('plusBtn');
const plusMenu = document.getElementById('plusMenu');
const imageInput = document.getElementById('imageInput');
const fileInput = document.getElementById('fileInput');
const fileStatus = document.getElementById('fileStatus');
const imagePreview = document.getElementById('imagePreview');
const themeBtn = document.getElementById('themeBtn');
const app = document.querySelector('.app');
const micBtn = document.getElementById('micBtn');
const recordingStatus = document.getElementById('recordingStatus');
const recordingPlayer = document.getElementById('recordingPlayer');

let mediaRecorder;
let chunks = [];

function addMessage(role, text) {
  const node = document.createElement('div');
  node.className = `msg ${role}`;
  node.textContent = text;
  messages.appendChild(node);
  messages.scrollTop = messages.scrollHeight;
}

function resetChat() {
  messages.innerHTML = '';
  addMessage('bot', 'Starting a fresh chat. How can I help you?');
}

function novaReply(input) {
  const text = input.trim().toLowerCase();

  if (['new chat', 'start over', 'reset'].includes(text)) {
    return 'Starting a fresh chat. How can I help you?';
  }

  if (text.includes('who created you')) {
    return 'I was created by Satwik with months of hard work.';
  }

  if (text.includes('who made nova ai')) {
    return 'Nova AI was created by Satwik after months of dedication and hard work.';
  }

  if (text.includes('where is satwik studying')) {
    return 'Satwik studies at Tapovan Vidyayam, JPT, NTR District, Andhra Pradesh, India.';
  }

  if (text.includes('+') || text.includes('plus button')) {
    return 'Click the + button to upload an image, record audio, or start a new chat.';
  }

  if (text.includes('record') || text.includes('microphone') || text.includes('voice')) {
    return 'Use the mic button: allow permission, click start, then click again to stop recording.';
  }

  if (text.includes('upload photo') || text.includes('add image') || text.includes('screenshot')) {
    return 'Use Upload image from + menu or drag & drop, then preview appears in the sidebar.';
  }

  if (text.includes('attach') || text.includes('file') || text.includes('document')) {
    return 'Use + → Upload file to attach documents, then confirm the selected filename.';
  }

  if (text.includes('dark mode') || text.includes('light mode') || text.includes('change background')) {
    return 'Use Toggle theme in Quick tools to switch between dark and light modes.';
  }

  return 'I can help with New Chat, + actions, uploads, recording, quick tools, and small HTML/CSS/JS help.';
}

chatForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const value = chatInput.value.trim();
  if (!value) return;
  addMessage('user', value);
  addMessage('bot', novaReply(value));
  chatInput.value = '';
});

newChatBtn.addEventListener('click', resetChat);
plusBtn.addEventListener('click', () => plusMenu.classList.toggle('hidden'));

document.querySelectorAll('[data-prompt]').forEach((button) => {
  button.addEventListener('click', () => {
    const prompt = button.dataset.prompt;
    addMessage('user', prompt);
    addMessage('bot', novaReply(prompt));
  });
});

document.querySelectorAll('#plusMenu button').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;

    if (action === 'new-chat') resetChat();
    if (action === 'upload-image') imageInput.click();
    if (action === 'upload-file') fileInput.click();
    if (action === 'record-audio') micBtn.click();
    if (action === 'add-screenshot') addMessage('bot', 'Use Upload image to add your screenshot file.');
    if (action === 'new-task') addMessage('bot', 'New task created. Share details and I will help break it down.');

    plusMenu.classList.add('hidden');
  });
});

imageInput.addEventListener('change', () => {
  const file = imageInput.files?.[0];
  if (!file) return;
  const src = URL.createObjectURL(file);
  imagePreview.src = src;
  imagePreview.classList.remove('hidden');
  fileStatus.textContent = `Image selected: ${file.name}`;
});

fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  fileStatus.textContent = file ? `File selected: ${file.name}` : 'No file selected';
});

themeBtn.addEventListener('click', () => {
  const current = app.getAttribute('data-theme');
  app.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
});

micBtn.addEventListener('click', async () => {
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    micBtn.textContent = '🎤 Start recording';
    recordingStatus.textContent = 'Processing audio...';
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    chunks = [];

    mediaRecorder.ondataavailable = (event) => chunks.push(event.data);
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      recordingPlayer.src = URL.createObjectURL(blob);
      recordingPlayer.classList.remove('hidden');
      recordingStatus.textContent = 'Recording ready. You can play it now.';
      stream.getTracks().forEach((track) => track.stop());
    };

    mediaRecorder.start();
    micBtn.textContent = '⏹ Stop recording';
    recordingStatus.textContent = 'Recording...';
  } catch {
    recordingStatus.textContent = 'Microphone permission denied or unavailable.';
  }
});

resetChat();
