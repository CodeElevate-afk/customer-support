const express = require('express');
const app = express();
const http = require('http').createServer(app);
const { Server } = require('socket.io');
const io = new Server(http);
const crypto = require('crypto');

app.use(express.static('public'));

const waitingQueue = [];
const availableAgents = new Set();
const busyAgents = new Set();
const activeChats = new Map();
const transcripts = new Map(); 

function updateQueuePositions() {
  waitingQueue.forEach((customerSocket, index) => {
    customerSocket.emit('queue-position', index + 1);
  });
}

function findChatPair(id) {
  return activeChats.get(id);
}

function assignChats() {
  while (waitingQueue.length > 0 && availableAgents.size > 0) {
    const customer = waitingQueue.shift();
    updateQueuePositions();

    const agent = [...availableAgents][0];
    availableAgents.delete(agent);
    busyAgents.add(agent);

    activeChats.set(customer.id, agent.id);
    activeChats.set(agent.id, customer.id);

    const sessionToken = customer.sessionToken;
    transcripts.set(sessionToken, []);

    const msg = {
      sender: 'system',
      text: 'You are now connected.',
      time: new Date().toISOString()
    };
    customer.emit('chat-message', msg);
    agent.emit('chat-message', msg);
  }
}

io.on('connection', socket => {
  console.log('User connected:', socket.id);

  socket.on('new-user', () => {
    const sessionToken = crypto.randomBytes(6).toString('hex');
    socket.sessionToken = sessionToken;
    socket.emit('session-token', sessionToken);

    waitingQueue.push(socket);
    updateQueuePositions();
    assignChats();
  });

  socket.on('agent-login', () => {
    availableAgents.add(socket);
    assignChats();
  });

  socket.on('send-chat-message', msg => {
    const pairId = findChatPair(socket.id);
    if (!pairId) return;

    const pairSocket = io.sockets.sockets.get(pairId);
    const time = new Date().toISOString();
    const senderRole = busyAgents.has(socket) ? 'agent' : 'customer';

    const chatMsg = {
      sender: senderRole,
      text: msg,
      time
    };

    const sessionToken = socket.sessionToken || pairSocket?.sessionToken;
    if (sessionToken && transcripts.has(sessionToken)) {
      transcripts.get(sessionToken).push(chatMsg);
    }

    io.to(pairId).emit('chat-message', chatMsg);
    socket.emit('chat-message', chatMsg);
  });

  socket.on('typing', (isTyping) => {
    const pairId = findChatPair(socket.id);
    if (pairId) {
      io.to(pairId).emit('typing', { from: socket.id, isTyping });
    }
  });

  socket.on('end-chat', () => {
    const pairId = findChatPair(socket.id);
    if (!pairId) return;

    const sessionToken = socket.sessionToken || io.sockets.sockets.get(pairId)?.sessionToken;

    const endMsg = {
      sender: 'system',
      text: 'Chat has been ended by one side.',
      time: new Date().toISOString()
    };

    socket.emit('chat-message', endMsg);
    io.to(pairId).emit('chat-message', endMsg);

    if (sessionToken) {
      socket.emit('chat-ended', { sessionToken });
      io.to(pairId).emit('chat-ended', { sessionToken });
    }

    activeChats.delete(socket.id);
    activeChats.delete(pairId);

    if (busyAgents.has(socket)) {
      busyAgents.delete(socket);
      availableAgents.add(socket);
    }
    const pairSocket = io.sockets.sockets.get(pairId);
    if (busyAgents.has(pairSocket)) {
      busyAgents.delete(pairSocket);
      availableAgents.add(pairSocket);
    }

    assignChats();
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);

    availableAgents.delete(socket);
    busyAgents.delete(socket);

    const queueIndex = waitingQueue.findIndex(s => s.id === socket.id);
    if (queueIndex !== -1) {
      waitingQueue.splice(queueIndex, 1);
      updateQueuePositions();
    }

    const pairId = findChatPair(socket.id);
    if (pairId) {
      io.to(pairId).emit('chat-message', {
        sender: 'system',
        text: 'Other user has disconnected.',
        time: new Date().toISOString()
      });

      activeChats.delete(socket.id);
      activeChats.delete(pairId);

      const pairSocket = io.sockets.sockets.get(pairId);
      if (busyAgents.has(pairSocket)) {
        busyAgents.delete(pairSocket);
        availableAgents.add(pairSocket);
      }
    }

    assignChats();
  });

  socket.on('submit-feedback', ({ sessionToken, feedback }) => {
    console.log(`Feedback for session ${sessionToken}: ${feedback}`);
  });
});

app.get('/transcript/:token', (req, res) => {
  const token = req.params.token;
  if (transcripts.has(token)) {
    res.json({ transcript: transcripts.get(token) });
  } else {
    res.status(404).json({ error: 'Transcript not found' });
  }
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
