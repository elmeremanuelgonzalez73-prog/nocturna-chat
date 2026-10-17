const socket = io();

const $ = (sel) => document.querySelector(sel);
const joinScreen = $('#join-screen');
const chatScreen = $('#chat-screen');
const messagesEl = $('#messages');
const messageInput = $('#message-input');

let currentUser = '';
let currentRoom = '';

// Theme
function setTheme(mode) {
  document.body.classList.toggle('light', mode === 'light');
  document.body.classList.toggle('dark', mode === 'dark');
  const icon = mode === 'light' ? '☀' : '☾';
  $('#theme-toggle').textContent = icon;
  $('#theme-toggle-join').textContent = icon;
  localStorage.setItem('nocturna-theme', mode);
}

const savedTheme = localStorage.getItem('nocturna-theme') || 'dark';
setTheme(savedTheme);

$('#theme-toggle').addEventListener('click', () => {
  setTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
});
$('#theme-toggle-join').addEventListener('click', () => {
  setTheme(document.body.classList.contains('dark') ? 'light' : 'dark');
});

// Join
$('#join-btn').addEventListener('click', join);
['username', 'room-id'].forEach(id => {
  $(`#${id}`).addEventListener('keydown', e => {
    if (e.key === 'Enter') join();
  });
});

function join() {
  const username = $('#username').value.trim();
  const roomId = $('#room-id').value.trim();
  const roomName = $('#room-name').value.trim();

  if (!username) {
    $('#username').focus();
    return;
  }
  if (!roomId) {
    $('#room-id').focus();
    return;
  }

  currentUser = username;
  currentRoom = roomId;

  socket.emit('join', { roomId, username, roomName: roomName || null });
}

socket.on('room-info', ({ roomId, roomName, messages }) => {
  joinScreen.classList.add('hidden');
  chatScreen.classList.remove('hidden');

  $('#display-username').textContent = currentUser;
  $('#display-room-id').textContent = `#${roomId}`;
  $('#display-room-name').textContent = roomName;
  $('#room-badge').textContent = roomId.slice(0, 3).toUpperCase();

  messagesEl.innerHTML = '';
  messages.forEach(m => appendMessage(m));
  messageInput.focus();
});

socket.on('room-name', (name) => {
  $('#display-room-name').textContent = name;
});

socket.on('message', (msg) => appendMessage(msg));
socket.on('system', (msg) => appendSystem(msg.text));

function appendMessage(msg) {
  const isOwn = msg.username === currentUser;
  const div = document.createElement('div');
  div.className = `msg ${isOwn ? 'own' : ''}`;
  div.dataset.id = msg.id;

  const time = new Date(msg.timestamp).toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit'
  });

  div.innerHTML = `
    <div class="meta">
      <span class="user">${escapeHtml(msg.username)}</span>
      <span class="time">${time}</span>
    </div>
    <div class="bubble">${escapeHtml(msg.text)}</div>
  `;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function appendSystem(text) {
  const div = document.createElement('div');
  div.className = 'msg system';
  div.innerHTML = `<div class="bubble">${escapeHtml(text)}</div>`;
  messagesEl.appendChild(div);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Send
function send() {
  const text = messageInput.value.trim();
  if (!text) return;
  socket.emit('message', { text });
  messageInput.value = '';
  messageInput.focus();
}

$('#send-btn').addEventListener('click', send);
messageInput.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    send();
  }
});

// Leave
$('#leave-btn').addEventListener('click', () => {
  location.reload();
});
