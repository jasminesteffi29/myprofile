const canvas = document.getElementById("sciFiGameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let highScore = 0;
let gameRunning = false;
let animationId;

// CAR-T Player Cell
const player = {
  x: 50,
  y: 110,
  w: 24,
  h: 24,
  speed: 4,
  dy: 0
};

let bullets = [];
let antigens = [];
let particles = [];
let spawnInterval = 75;
let frames = 0;

function resetGame() {
  player.y = 110;
  player.dy = 0;
  bullets = [];
  antigens = [];
  particles = [];
  score = 0;
  frames = 0;
  document.getElementById("game-score").innerText = "00000";
}

function startGame() {
  document.getElementById("game-overlay").style.display = "none";
  resetGame();
  gameRunning = true;
  loop();
}

function gameOver() {
  gameRunning = false;
  cancelAnimationFrame(animationId);
  if (score > highScore) {
    highScore = score;
    document.getElementById("game-high").innerText = String(highScore).padStart(5, '0');
  }
  document.getElementById("overlay-msg").innerText = "RECEPTOR EXHAUSTED - TRY AGAIN";
  document.getElementById("start-btn").innerText = "RE-ACTIVATE CAR-T";
  document.getElementById("game-overlay").style.display = "flex";
}

// Player Controls
const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "Space" && gameRunning) {
    // Fire Perforin Cytotoxic Particle
    bullets.push({ x: player.x + player.w, y: player.y + player.h / 2, r: 4, speed: 7 });
    e.preventDefault();
  }
});
window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

function loop() {
  if (!gameRunning) return;
  frames++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Player Movement
  if (keys["ArrowUp"] || keys["KeyW"]) player.y -= player.speed;
  if (keys["ArrowDown"] || keys["KeyS"]) player.y += player.speed;

  // Boundary checks
  if (player.y < 0) player.y = 0;
  if (player.y + player.h > canvas.height) player.y = canvas.height - player.h;

  // Render CAR-T Cell (Cyan Core with Antigen Receptor Spikes)
  ctx.fillStyle = "#38bdf8";
  ctx.shadowColor = "#38bdf8";
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.arc(player.x + 12, player.y + 12, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.shadowBlur = 0;

  // Render CAR Receptors (Spikes)
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(player.x + 24, player.y + 12);
  ctx.lineTo(player.x + 30, player.y + 12);
  ctx.stroke();

  // Handle Bullets (Cytolytic Granules)
  ctx.fillStyle = "#a855f7";
  bullets.forEach((b, index) => {
    b.x += b.speed;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    if (b.x > canvas.width) bullets.splice(index, 1);
  });

  // Spawn Target Antigens / Cancer Cells
  if (frames % spawnInterval === 0) {
    const size = Math.random() * 16 + 14;
    antigens.push({
      x: canvas.width,
      y: Math.random() * (canvas.height - size),
      w: size,
      h: size,
      speed: Math.random() * 2 + 1.8
    });
  }

  // Handle Antigens
  antigens.forEach((a, aIdx) => {
    a.x -= a.speed;

    // Render Tumor Antigen
    ctx.fillStyle = "#ef4444";
    ctx.shadowColor = "#ef4444";
    ctx.shadowBlur = 8;
    ctx.fillRect(a.x, a.y, a.w, a.h);
    ctx.shadowBlur = 0;

    // Check collision with Player
    if (
      player.x < a.x + a.w &&
      player.x + player.w > a.x &&
      player.y < a.y + a.h &&
      player.y + player.h > a.y
    ) {
      gameOver();
    }

    // Check collision with bullets
    bullets.forEach((b, bIdx) => {
      if (
        b.x + b.r > a.x &&
        b.x - b.r < a.x + a.w &&
        b.y + b.r > a.y &&
        b.y - b.r < a.y + a.h
      ) {
        // Cytolysis explosion effect
        for (let i = 0; i < 6; i++) {
          particles.push({
            x: a.x,
            y: a.y,
            dx: (Math.random() - 0.5) * 4,
            dy: (Math.random() - 0.5) * 4,
            life: 20
          });
        }
        antigens.splice(aIdx, 1);
        bullets.splice(bIdx, 1);
        score += 100;
        document.getElementById("game-score").innerText = String(score).padStart(5, '0');
      }
    });

    if (a.x + a.w < 0) {
      antigens.splice(aIdx, 1);
    }
  });

  // Particle explosion rendering
  particles.forEach((p, pIdx) => {
    p.x += p.dx;
    p.y += p.dy;
    p.life--;
    ctx.fillStyle = "#f97316";
    ctx.fillRect(p.x, p.y, 3, 3);
    if (p.life <= 0) particles.splice(pIdx, 1);
  });

  animationId = requestAnimationFrame(loop);
}