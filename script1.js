const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
    constructor(x, y, radius, color){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update(){
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity){
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw(){
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
    }
    update(){
        this.draw();
        this.x += this.velocity.x;
        this.y += this.velocity.y;
    }
}

const x = canvas.width / 2;
const y = canvas.height / 2;

const player = new Player(x, y, 30, 'blue');
const projectiles = [];
const enemies = [];

// Spawn enemies outside canvas
function spawnEnemies(){
    setInterval(() => {
        const radius = Math.random() * (30 - 5) + 5; // Random size between 10 and 30
        

        let enemyX, enemyY;

        // Randomly determine the enemy's spawn side (top, bottom, left, right)
        const side = Math.random() < 0.5 ? 'vertical' : 'horizontal';

        if (side === 'vertical') {
            enemyX = Math.random() * canvas.width; // Anywhere along the width
            enemyY = Math.random() < 0.5 ? 0 - radius : canvas.height + radius; // Top or bottom
        } else {
            enemyX = Math.random() < 0.5 ? 0 - radius : canvas.width + radius; // Left or right
            enemyY = Math.random() * canvas.height; // Anywhere along the height
        }

        // Calculate the angle to the center of the canvas (player's position)
        const angle = Math.atan2(canvas.height / 2 - enemyY, canvas.width / 2 - enemyX);

        const color = `hsl(${Math.random() * 360}, 50%, 50%)` 

        const velocity = {
            x: Math.cos(angle) * 2, // Adjust speed
            y: Math.sin(angle) * 2
        };

        enemies.push(new Enemy(enemyX, enemyY, radius, color, velocity));
    }, 1000); // Spawn an enemy every second
}

let animationId 

function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    player.draw();

    projectiles.forEach((projectile, index) => {
        projectile.update();

        // Remove projectiles that go off-screen
        if (
            projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
        ) {
            projectiles.splice(index, 1);
        }
    });

    enemies.forEach((enemy, index) => {
        enemy.update();

        // Remove enemies that reach the center and end game.
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (dist - enemy.radius - player.radius < 1) {
            enemies.splice(index.lenght);
            
            cancelAnimationFrame(animationId);
        }
        

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y);
            if (dist - enemy.radius - projectile.radius < 1){
                // Remove enemy and projectile
                //settimeout remove weird flashes from the other enemies trying to respawn
                setTimeout(() => {
                    enemies.splice(index, 1);
                projectiles.splice(projectileIndex, 1);
                }, 0)
                
            }
            
        })

        
    });
}

// Shoot projectiles
addEventListener('click', (event) => {
    const angle = Math.atan2(
        event.clientY - canvas.height / 2,
        event.clientX - canvas.width / 2
    );

    const velocity = {
        x: Math.cos(angle) * 6,
        y: Math.sin(angle) * 6
    };

    projectiles.push(
        new Projectile(canvas.width / 2, canvas.height / 2, 5, 'red', velocity)
    );
});

animate();
spawnEnemies();
