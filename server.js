const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;
const GRID_SIZE = 40; // 800/20 = 40 cells

app.use(express.static('public'));

let players = {};

io.on('connection', (socket) => {
  console.log('Jogador conectado:', socket.id);
  players[socket.id] = { x: 20, y: 20, direction: 'right', isAlive: true };

  socket.on('move', (direction) => {
    if (players[socket.id] && players[socket.id].isAlive) {
      players[socket.id].direction = direction;
    }
  });

  socket.on('restart', () => {
    if (players[socket.id]) {
      players[socket.id] = { x: 20, y: 20, direction: 'right', isAlive: true };
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
  });
});

setInterval(() => {
  for (let id in players) {
    let p = players[id];
    if (!p.isAlive) continue;

    let newX = p.x;
    let newY = p.y;

    switch (p.direction) {
      case 'up': newY -= 1; break;
      case 'down': newY += 1; break;
      case 'left': newX -= 1; break;
      case 'right': newX += 1; break;
    }

    // Verifica colisão com as paredes
    if (newX < 0 || newX >= GRID_SIZE || newY < 0 || newY >= GRID_SIZE) {
      p.isAlive = false;
    } else {
      p.x = newX;
      p.y = newY;
    }
  }
  io.emit('state', players);
}, 100);

http.listen(PORT, () => {
  console.log('Servidor rodando na porta', PORT);
});
