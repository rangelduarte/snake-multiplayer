const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const socket = io();

let players = {};
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
  players = data;
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
  
  // Desenha os jogadores
  for (let id in players) {
    const p = players[id];
    ctx.fillStyle = id === socket.id ? 'lime' : 'red';
    if (!p.isAlive) {
      ctx.fillStyle = '#666';
    }
    ctx.fillRect(p.x * 20, p.y * 20, 18, 18);
  }
}
