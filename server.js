const express = require('express');
const cors = require('cors');
const { Server } = require('socket.io');
const http = require('http');

const app = express();

// CORS 설정
app.use(cors({
  origin: 'https://toktok-sub.netlify.app', // 허용할 클라이언트 도메인
  methods: ['GET', 'POST'], // 허용할 HTTP 메서드
  credentials: true, // 인증 정보(Credentials) 허용
}));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'https://toktok-sub.netlify.app', // WebSocket CORS 설정
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

app.get('/', (req, res) => {
  res.send('Signaling Server is running.');
});

const connectedUsers = {};

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  connectedUsers[socket.id] = socket;

  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
    delete connectedUsers[socket.id];
  });

  socket.on('offer', (data) => {
    console.log('Offer received from:', socket.id);
    socket.to(data.target).emit('offer', { sdp: data.sdp, caller: socket.id });
  });

  socket.on('answer', (data) => {
    console.log('Answer received from:', socket.id);
    socket.to(data.target).emit('answer', { sdp: data.sdp, caller: socket.id });
  });

  socket.on('candidate', (data) => {
    console.log('Candidate received from:', socket.id);
	console.log('Received Candidate:', data);
    if (data.target) {
      socket.to(data.target).emit('candidate', {
        candidate: data.candidate,
        caller: socket.id,
      });
    }
	if (peerConnection.current) {
    peerConnection.current.addIceCandidate(new RTCIceCandidate(data.candidate));
  }
	
  });

  socket.on('getUsers', () => {
    const userIds = Object.keys(connectedUsers).filter((id) => id !== socket.id);
    socket.emit('userList', userIds);
  });
});



const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Signaling server running on port ${PORT}`);
});