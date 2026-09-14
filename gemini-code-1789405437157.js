const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let score = 0;
let highScore = 0;
let running = false;
let animId;

// CAR-T Player Object
const player = {
  x: 40,
  y: 65,
  r: 10,
  speed: 3.5
};

let bullets = [];
let obstacles = [];
let frame = 0;

function reset() {
  player.y = 65;
  bullets = [];
  obstacles = [];
  score = 0;
  frame = 0;
  document.getElementById("game-score").innerText = "00000";
}

function startGame() {
  document.getElementById("game-overlay").style.display = "none";
  reset();
  running = true;
  tick();
}

function endGame() {
  running = false;
  cancelAnimationFrame(animId);
  if (score > highScore) {
    highScore = score;
    document.getElementById("game-high").innerText = String(highScore).padStart(5, '0');
  }
  document.getElementById("overlay-msg").innerText = "IMMUNOSUPPRESSION DETECTED";
  document.querySelector(".overlay-modal p").innerText = "Game Over. Re-engage receptors to try again.";
  document.querySelector(".btn-play").innerText = "RE-DEPLOY CAR-T";
  document.getElementById("game-overlay").style.display = "flex";
}

const keys = {};
window.addEventListener("keydown", (e) => {
  keys[e.code] = true;
  if (e.code === "Space" && running) {
    // Fire cytolytic granuoles
    bullets.push({ x: player.x + 12, y: player.y, r: 3, speed: 6 });
    e.preventDefault();
  }
});
window.addEventListener("keyup", (e) => {
  keys[e.code] = false;
});

function tick() {
  if (!running) return;
  frame++;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Steer Player
  if (keys["ArrowUp"] || keys["KeyW"]) player.y -= player.speed;
  if (keys["ArrowDown"] || keys["KeyS"]) player.y += player.speed;

  if (player.y - player.r < 0) player.y = player.r;
  if (player.y + player.r > canvas.height) player.y = canvas.height - player.r;

  // Draw Player CAR-T cell
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.arc(player.x, player.y, player.r, 0, Math.PI * 2);
  ctx.fill();

  // Draw TCR Receptors (Spikes)
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(player.x + player.r, player.y);
  ctx.lineTo(player.x + player.r + 6, player.y);
  ctx.stroke();

  // Draw Projectiles
  ctx.fillStyle = "#a855f7";
  bullets.forEach((b, i) => {
    b.x += b.speed;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
    if (b.x > canvas.width) bullets.splice(i, 1);
  });

  // Spawn Target / Pathogen
  if (frame % 60 === 0) {
    const size = Math.random() * 12 + 10;
    obstacles.push({
      x: canvas.width,
      y: Math.random() * (canvas.height - size * 2) + size,
      r: size,
      speed: Math.random() * 1.5 + 2
    });
  }

  // Manage Pathogens
  obstacles.forEach((ob, oIdx) => {
    ob.x -= ob.speed;

    // Draw pathogen / tumor antigen
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.arc(ob.x, ob.y, ob.r, 0, Math.PI * 2);
    ctx.fill();

    // Check collision with Player
    const dist = Math.hypot(player.x - ob.x, player.y - ob.y);
    if (dist < player.r + ob.r) {
      endGame();
    }

    // Check collision with Bullets
    bullets.forEach((b, bIdx) => {
      const hitDist = Math.hypot(b.x - ob.x, b.y - ob.y);
      if (hitDist < b.r + ob.r) {
        obstacles.splice(oIdx, 1);
        bullets.splice(bIdx, 1);
        score += 100;
        document.getElementById("game-score").innerText = String(score).padStart(5, '0');
      }
    });

    if (ob.x + ob.r < 0) {
      obstacles.splice(oIdx, 1);
    }
  });

  animId = requestAnimationFrame(tick);
}
