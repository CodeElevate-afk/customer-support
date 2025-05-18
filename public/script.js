let socket;
let sessionToken = null;

function setupSocket(isAgent) {
  socket = io();

  socket.on('chat-message', msg => {
  const div = document.createElement('div');
  div.classList.add('message');
  div.classList.add(msg.sender === socket.id ? 'you' : 'other');

  const content = document.createElement('div');
  content.textContent = msg.text;

  const time = document.createElement('div');
  time.classList.add('timestamp');
  const t = new Date(msg.time).toLocaleTimeString();
  time.textContent = msg.sender === socket.id ? `You • ${t}` : `Them • ${t}`;

  div.appendChild(content);
  div.appendChild(time);

  document.getElementById('messages').appendChild(div);
  document.getElementById('messages').scrollTop = document.getElementById('messages').scrollHeight;
});


  socket.on('chat-transcript', transcript => {
    const text = transcript.map(msg =>
      `[${msg.time}] ${msg.sender}: ${msg.text}`
    ).join('\n');

    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcript-${sessionToken}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  if (!isAgent) {
    // Auto-generate session
    generateToken();
  }
}

function generateToken() {
  sessionToken = Math.random().toString(36).substring(2, 10);
  document.getElementById('session-token').textContent = sessionToken;
  socket.emit('join-session', sessionToken);
}

function joinSession() {
  sessionToken = document.getElementById('sessionInput').value.trim();
  if (sessionToken) {
    socket.emit('join-session', sessionToken);
  }
}

function sendMessage() {
  const msg = document.getElementById('msg').value;
  if (msg && sessionToken) {
    socket.emit('chat-message', msg);
    document.getElementById('msg').value = '';
  }
}

function getTranscript() {
  if (sessionToken) {
    socket.emit('request-transcript', sessionToken);
  }
}
