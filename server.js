const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
  console.log('Jogador conectado:', socket.id);
  players[socket.id] = { x: 15, y: 15, direction: 'right' };

  socket.on('move', (direction) => {
    if (players[socket.id]) players[socket.id].direction = direction;
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
  });
});

setInterval(() => {
  for (let id in players) {
    let p = players[id];
    switch (p.direction) {
      case 'up': p.y -= 1; break;
      case 'down': p.y += 1; break;
      case 'left': p.x -= 1; break;
      case 'right': p.x += 1; break;
    }
  }
  io.emit('state', players);
}, 100);

http.listen(PORT, () => {
  console.log('Servidor rodando na porta', PORT);
});
