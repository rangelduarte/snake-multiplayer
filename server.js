const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;
const GRID_SIZE = 40; // 800/20 = 40 cells
const MAX_FOODS = 3;

app.use(express.static('public'));

let players = {};
let foods = [];
let snakeBodies = {};

// Função para gerar posição aleatória para comida
function generateFood() {
  let newFood;
  let validPosition = false;
  
  while (!validPosition) {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    
    // Verifica se a posição não está ocupada por outra comida
    validPosition = true;
    for (let food of foods) {
      if (food.x === newFood.x && food.y === newFood.y) {
        validPosition = false;
        break;
      }
    }
    
    // Verifica se a posição não está ocupada por nenhuma cobra
    if (validPosition) {
      for (let id in snakeBodies) {
        for (let segment of snakeBodies[id]) {
          if (segment.x === newFood.x && segment.y === newFood.y) {
            validPosition = false;
            break;
          }
        }
        if (!validPosition) break;
      }
    }
  }
  
  return newFood;
}

// Inicializa as comidas
for (let i = 0; i < MAX_FOODS; i++) {
  foods.push(generateFood());
}

io.on('connection', (socket) => {
  console.log('Jogador conectado:', socket.id);
  players[socket.id] = { x: 20, y: 20, direction: 'right', isAlive: true };
  snakeBodies[socket.id] = [{x: 20, y: 20}];

  socket.on('move', (direction) => {
    if (players[socket.id] && players[socket.id].isAlive) {
      players[socket.id].direction = direction;
    }
  });

  socket.on('restart', () => {
    if (players[socket.id]) {
      players[socket.id] = { x: 20, y: 20, direction: 'right', isAlive: true };
      snakeBodies[socket.id] = [{x: 20, y: 20}];
    }
  });

  socket.on('disconnect', () => {
    delete players[socket.id];
    delete snakeBodies[socket.id];
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
      continue;
    }

    // Verifica colisão com outras cobras
    for (let otherId in snakeBodies) {
      if (otherId === id) continue;
      const otherBody = snakeBodies[otherId];
      for (let segment of otherBody) {
        if (segment.x === newX && segment.y === newY) {
          p.isAlive = false;
          break;
        }
      }
      if (!p.isAlive) break;
    }

    // Verifica colisão com o próprio corpo
    const myBody = snakeBodies[id];
    for (let segment of myBody) {
      if (segment.x === newX && segment.y === newY) {
        p.isAlive = false;
        break;
      }
    }

    if (!p.isAlive) continue;

    // Atualiza posição
    p.x = newX;
    p.y = newY;

    // Verifica se comeu comida
    let ateFood = false;
    for (let i = foods.length - 1; i >= 0; i--) {
      if (foods[i].x === newX && foods[i].y === newY) {
        foods.splice(i, 1);
        ateFood = true;
        // Adiciona nova comida imediatamente
        foods.push(generateFood());
        break;
      }
    }

    // Atualiza o corpo da cobra
    myBody.unshift({x: newX, y: newY});
    if (!ateFood) {
      myBody.pop();
    }
  }

  // Garante que sempre existam 3 comidas
  while (foods.length < MAX_FOODS) {
    foods.push(generateFood());
  }

  // Envia estado atualizado para todos os clientes
  io.emit('state', { players, foods, snakeBodies });
}, 100);

http.listen(PORT, () => {
  console.log('Servidor rodando na porta', PORT);
});
