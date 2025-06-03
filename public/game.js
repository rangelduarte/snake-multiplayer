const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const socket = io();

let players = {};
let foods = [];
let snakeBodies = {};
let isDead = false;

// Criar botão de reiniciar (inicialmente escondido)
const restartButton = document.createElement('button');
restartButton.textContent = 'Reiniciar';
restartButton.style.display = 'none';
restartButton.style.position = 'absolute';
restartButton.style.top = '50%';
restartButton.style.left = '50%';
restartButton.style.transform = 'translate(-50%, -50%)';
restartButton.style.padding = '10px 20px';
restartButton.style.fontSize = '20px';
restartButton.style.cursor = 'pointer';
restartButton.style.zIndex = '1000';
document.body.appendChild(restartButton);

restartButton.addEventListener('click', () => {
  socket.emit('restart');
  restartButton.style.display = 'none';
  isDead = false;
});

document.addEventListener('keydown', (e) => {
  if (isDead) return;
  const keyMap = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
  if (keyMap[e.key]) socket.emit('move', keyMap[e.key]);
});

socket.on('state', (data) => {
  players = data.players;
  foods = data.foods;
  snakeBodies = data.snakeBodies;
  
  const myPlayer = players[socket.id];
  
  if (myPlayer && !myPlayer.isAlive && !isDead) {
    isDead = true;
    restartButton.style.display = 'block';
  }
  
  draw();
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Desenha a grade
  ctx.strokeStyle = '#333';
  for (let i = 0; i <= canvas.width; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, canvas.height);
    ctx.stroke();
  }
  for (let i = 0; i <= canvas.height; i += 20) {
    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(canvas.width, i);
    ctx.stroke();
  }
  
  // Desenha as comidas
  ctx.fillStyle = 'yellow';
  for (let food of foods) {
    ctx.beginPath();
    ctx.arc(food.x * 20 + 10, food.y * 20 + 10, 5, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Desenha as cobras
  for (let id in players) {
    const p = players[id];
    const body = snakeBodies[id];
    
    // Desenha o corpo
    ctx.fillStyle = id === socket.id ? 'lime' : 'red';
    if (!p.isAlive) {
      ctx.fillStyle = '#666';
    }
    
    for (let segment of body) {
      ctx.fillRect(segment.x * 20, segment.y * 20, 18, 18);
    }
  }
}
