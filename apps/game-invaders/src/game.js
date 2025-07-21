// apps/game-invaders/src/game.js

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = document.getElementById('score');
    const livesDisplay = document.getElementById('lives');
    const startButton = document.getElementById('startButton');
    const messageBox = document.getElementById('messageBox');
    const messageText = document.getElementById('messageText');
    const messageButton = document.getElementById('messageButton');

    // --- Game Configuration ---
    const playerWidth = 50;
    const playerHeight = 20;
    const playerSpeed = 4; // Was 2
    const projectileWidth = 5;
    const projectileHeight = 15;
    const projectileSpeed = 7.5; // Was 2.5
    const invaderRows = 5;
    const invaderCols = 10;
    const invaderWidth = 40;
    const invaderHeight = 30;
    const invaderGap = 10;
    const invaderSpeed = 0.5; // Was 1
    const invaderDrop = 30;
    const invaderFireRate = 0.002; // Was 0.02, reduced by 90%

    // --- Game State ---
    let player;
    let projectiles = [];
    let invaders = [];
    let invaderProjectiles = [];
    let score = 0;
    let lives = 3;
    let gameOver = true;
    let gameLoopId;
    let keys = {};
    let invaderDirection = 1; // 1 for right, -1 for left
    let invaderMoveTimer = 0;

    // --- Utility Functions ---
    function showMessage(message) {
        messageText.textContent = message;
        messageBox.style.display = 'block';
        startButton.style.display = 'block';
    }

    messageButton.addEventListener('click', () => {
        messageBox.style.display = 'none';
    });

    // --- Player Class ---
    class Player {
        constructor() {
            this.x = canvas.width / 2 - playerWidth / 2;
            this.y = canvas.height - playerHeight - 20;
            this.width = playerWidth;
            this.height = playerHeight;
            this.color = '#00ff00';
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
            // Add a little "cockpit"
            ctx.fillStyle = '#000';
            ctx.fillRect(this.x + this.width / 2 - 5, this.y + 5, 10, 10);
        }

        update() {
            if (keys['ArrowLeft'] && this.x > 0) {
                this.x -= playerSpeed;
            }
            if (keys['ArrowRight'] && this.x < canvas.width - this.width) {
                this.x += playerSpeed;
            }
        }

        shoot() {
            projectiles.push(new Projectile(this.x + this.width / 2 - projectileWidth / 2, this.y));
        }
    }

    // --- Projectile Class ---
    class Projectile {
        constructor(x, y, color = '#00ff00', speed = -projectileSpeed) {
            this.x = x;
            this.y = y;
            this.width = projectileWidth;
            this.height = projectileHeight;
            this.color = color;
            this.speed = speed;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, this.width, this.height);
        }

        update() {
            this.y += this.speed;
        }
    }

    // --- Invader Class ---
    class Invader {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.width = invaderWidth;
            this.height = invaderHeight;
            this.color = '#00ff00';
        }

        draw() {
            ctx.fillStyle = this.color;
            // Simple blocky invader shape
            ctx.fillRect(this.x, this.y, this.width, this.height);
            ctx.clearRect(this.x + 5, this.y + 5, 10, 10);
            ctx.clearRect(this.x + this.width - 15, this.y + 5, 10, 10);
        }

        move(dx, dy) {
            this.x += dx;
            this.y += dy;
        }
    }

    // --- Game Initialization ---
    function init() {
        // Reset game state
        score = 0;
        lives = 3;
        gameOver = false;
        projectiles = [];
        invaders = [];
        invaderProjectiles = [];
        invaderDirection = 1;
        
        scoreDisplay.textContent = score;
        livesDisplay.textContent = lives;
        startButton.style.display = 'none';
        messageBox.style.display = 'none';

        // Create player
        player = new Player();

        // Create invaders
        for (let r = 0; r < invaderRows; r++) {
            for (let c = 0; c < invaderCols; c++) {
                const x = c * (invaderWidth + invaderGap) + invaderGap;
                const y = r * (invaderHeight + invaderGap) + invaderGap + 50;
                invaders.push(new Invader(x, y));
            }
        }

        // Start game loop
        if (gameLoopId) cancelAnimationFrame(gameLoopId);
        gameLoop();
    }

    // --- Collision Detection ---
    function checkCollisions() {
        // Player projectiles with invaders
        for (let i = projectiles.length - 1; i >= 0; i--) {
            for (let j = invaders.length - 1; j >= 0; j--) {
                if (
                    projectiles[i] && invaders[j] &&
                    projectiles[i].x < invaders[j].x + invaders[j].width &&
                    projectiles[i].x + projectiles[i].width > invaders[j].x &&
                    projectiles[i].y < invaders[j].y + invaders[j].height &&
                    projectiles[i].y + projectiles[i].height > invaders[j].y
                ) {
                    projectiles.splice(i, 1);
                    invaders.splice(j, 1);
                    score += 10;
                    scoreDisplay.textContent = score;
                    break; // Move to next projectile
                }
            }
        }

        // Invader projectiles with player
        for (let i = invaderProjectiles.length - 1; i >= 0; i--) {
            if (
                invaderProjectiles[i].x < player.x + player.width &&
                invaderProjectiles[i].x + invaderProjectiles[i].width > player.x &&
                invaderProjectiles[i].y < player.y + player.height &&
                invaderProjectiles[i].y + invaderProjectiles[i].height > player.y
            ) {
                invaderProjectiles.splice(i, 1);
                handlePlayerHit();
            }
        }
        
        // Invaders with player
        for (const invader of invaders) {
             if (
                invader.x < player.x + player.width &&
                invader.x + invader.width > player.x &&
                invader.y < player.y + player.height &&
                invader.y + invader.height > player.y
            ) {
                gameOver = true;
                showMessage("Game Over! The invaders reached you!");
            }
        }
    }
    
    function handlePlayerHit() {
        lives--;
        livesDisplay.textContent = lives;
        if (lives <= 0) {
            gameOver = true;
            showMessage("Game Over! Final Score: " + score);
        } else {
             // Brief invincibility/flash effect could be added here
        }
    }

    // --- Game Loop ---
    function update() {
        if (gameOver) return;

        player.update();

        // Update projectiles
        projectiles.forEach((p, index) => {
            p.update();
            if (p.y < 0) projectiles.splice(index, 1);
        });
        
        invaderProjectiles.forEach((p, index) => {
            p.update();
            if (p.y > canvas.height) invaderProjectiles.splice(index, 1);
        });

        // Update invaders
        let wallHit = false;
        let drop = 0;
        for (const invader of invaders) {
            invader.move(invaderSpeed * invaderDirection, 0);
            if (invader.x <= 0 || invader.x >= canvas.width - invader.width) {
                wallHit = true;
            }
            // Check if invaders reached the bottom
            if(invader.y + invader.height >= player.y) {
                 gameOver = true;
                 showMessage("Game Over! The invaders reached the bottom!");
            }
        }

        if (wallHit) {
            invaderDirection *= -1;
            drop = invaderDrop;
            for (const invader of invaders) {
                invader.move(0, drop);
            }
        }
        
        // Invader firing
        for (const invader of invaders) {
            if (Math.random() < invaderFireRate) {
                // Find a "front-line" invader to shoot
                const canShoot = !invaders.some(other => 
                    other !== invader && 
                    other.x < invader.x + invader.width &&
                    other.x + other.width > invader.x &&
                    other.y > invader.y
                );
                if(canShoot) {
                    invaderProjectiles.push(new Projectile(invader.x + invader.width / 2, invader.y + invader.height, '#ff0000', projectileSpeed));
                }
            }
        }

        checkCollisions();
        
        // Win condition
        if(invaders.length === 0) {
            gameOver = true;
            showMessage("You Win! Final Score: " + score);
        }
    }

    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw game objects
        if (!gameOver) player.draw();
        projectiles.forEach(p => p.draw());
        invaders.forEach(inv => inv.draw());
        invaderProjectiles.forEach(p => p.draw());
    }

    function gameLoop() {
        update();
        draw();
        if (!gameOver) {
            gameLoopId = requestAnimationFrame(gameLoop);
        }
    }
    
    // --- Event Listeners ---
    window.addEventListener('keydown', (e) => {
        keys[e.key] = true;
        if (e.key === ' ' && !gameOver) {
            e.preventDefault();
            // Limit firing rate
            if (projectiles.filter(p => p.speed < 0).length < 3) {
                 player.shoot();
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        keys[e.key] = false;
    });

    startButton.addEventListener('click', init);

    // Initial message
    showMessage("Ready to defend the galaxy? Press Start!");
});

