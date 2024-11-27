const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

// High-DPI scaling
let dpr = window.devicePixelRatio || 1;

function setCanvasSize() {
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${innerWidth}px`;
    canvas.style.height = `${innerHeight}px`;
}

setCanvasSize();

// Disable image smoothing for crisp pixel art
ctx.imageSmoothingEnabled = false;

// Load images
const playerImage = new Image();
playerImage.src = 'player-1.png'; // Replace with your player image path

const enemyImage = new Image();
enemyImage.src = 'firemonster-1.png'; // Replace with your enemy image path

class Player {
    constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    draw() {
        if (playerImage.complete) {
            ctx.drawImage(
                playerImage,
                this.x - this.radius,
                this.y - this.radius,
                this.radius * 2,
                this.radius * 2
            );
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = 'blue';
            ctx.fill();
        }
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.velocity = velocity;
    }

    draw() {
        if (enemyImage.complete) {
            ctx.drawImage(
                enemyImage,
                this.x - this.radius,
                this.y - this.radius,
                this.radius * 2,
                this.radius * 2
            );
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = 'green';
            ctx.fill();
        }
    }

    update() {
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

let player = new Player(innerWidth / 2, innerHeight / 2, 70);
const projectiles = [];
const enemies = [];

// Spawn enemies outside canvas
function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * (50 - 10) + 10;

        let enemyX, enemyY;
        const side = Math.random() < 0.5 ? 'vertical' : 'horizontal';

        if (side === 'vertical') {
            enemyX = Math.random() * innerWidth; // Anywhere along the width
            enemyY = Math.random() < 0.5 ? 0 - radius : innerHeight + radius; // Top or bottom
        } else {
            enemyX = Math.random() < 0.5 ? 0 - radius : innerWidth + radius; // Left or right
            enemyY = Math.random() * innerHeight; // Anywhere along the height
        }

        const angle = Math.atan2(innerHeight / 2 - enemyY, innerWidth / 2 - enemyX);
        const velocity = {
            x: Math.cos(angle) * 2,
            y: Math.sin(angle) * 2,
        };

        enemies.push(new Enemy(enemyX, enemyY, radius, velocity));
    }, 1000);
}

let animationId;

function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player.draw();

    projectiles.forEach((projectile, index) => {
        projectile.update();
        if (
            projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width / dpr ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height / dpr
        ) {
            projectiles.splice(index, 1);
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();

        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - enemy.radius - player.radius < 1) {
            enemies.splice(index);
            cancelAnimationFrame(animationId);
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            if (dist - enemy.radius - projectile.radius < 1) {
                setTimeout(() => {
                    enemies.splice(index, 1);
                    projectiles.splice(projectileIndex, 1);
                }, 0);
            }
        });
    });
}

// Handle window resizing
window.addEventListener('resize', () => {
    const oldWidth = canvas.width;
    const oldHeight = canvas.height;

    setCanvasSize();

    const scaleX = canvas.width / oldWidth;
    const scaleY = canvas.height / oldHeight;

    player.x *= scaleX;
    player.y *= scaleY;

    enemies.forEach((enemy) => {
        enemy.x *= scaleX;
        enemy.y *= scaleY;
    });

    projectiles.forEach((projectile) => {
        projectile.x *= scaleX;
        projectile.y *= scaleY;
    });
});

// Shoot projectiles
addEventListener('click', (event) => {
    const angle = Math.atan2(
        event.clientY - player.y,
        event.clientX - player.x
    );

    const velocity = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6,
    };

    projectiles.push(
        new Projectile(player.x, player.y, 5, 'red', velocity)
    );
});

animate();
spawnEnemies();
