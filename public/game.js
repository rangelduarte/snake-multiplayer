const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const socket = io();

let players = {};

document.addEventListener('keydown', (e) => {
  const keyMap = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
  if (keyMap[e.key]) socket.emit('move', keyMap[e.key]);
});

socket.on('state', (data) => {
  players = data;
  draw();
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let id in players) {
    const p = players[id];
    ctx.fillStyle = id === socket.id ? 'lime' : 'red';
    ctx.fillRect(p.x * 20, p.y * 20, 18, 18);
  }
}
