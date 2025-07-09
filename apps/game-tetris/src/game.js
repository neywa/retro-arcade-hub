// retro-arcade-hub/apps/game-tetris/src/game.js

const canvas = document.getElementById('tetrisCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('startButton');

const ROW = 20;
const COL = 10;
const SQ = 20; // Size of each square
const VACANT = "WHITE"; // Color of an empty square

// --- Tetromino Shapes and Colors ---
// Standard Tetris shapes within a 4x4 grid for easier rotation
const PIECES = [
    // I
    [
        [
            [0,0,0,0],
            [1,1,1,1],
            [0,0,0,0],
            [0,0,0,0]
        ], "cyan"
    ],
    // J
    [
        [
            [1,0,0],
            [1,1,1],
            [0,0,0]
        ], "blue"
    ],
    // L
    [
        [
            [0,0,1],
            [1,1,1],
            [0,0,0]
        ], "orange"
    ],
    // O
    [
        [
            [1,1],
            [1,1]
        ], "yellow"
    ],
    // S
    [
        [
            [0,1,1],
            [1,1,0],
            [0,0,0]
        ], "green"
    ],
    // T
    [
        [
            [0,1,0],
            [1,1,1],
            [0,0,0]
        ], "purple"
    ],
    // Z
    [
        [
            [1,1,0],
            [0,1,1],
            [0,0,0]
        ], "red"
    ]
];

// --- Game State Variables ---
let board;
let currentPiece;
let score;
let gameOver;
let gameLoopId;
let dropStart;

// --- Drawing Functions ---

// Draw a single square on the board
function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * SQ, y * SQ, SQ, SQ);
    ctx.strokeStyle = "#333"; // Darker grid lines
    ctx.strokeRect(x * SQ, y * SQ, SQ, SQ);
}

// Draw the entire game board
function drawBoard() {
    for (let r = 0; r < ROW; r++) {
        for (let c = 0; c < COL; c++) {
            drawSquare(c, r, board[r][c]);
        }
    }
}

// --- Piece Object and Logic ---
function Piece(tetromino, color) {
    this.tetromino = tetromino;
    this.color = color;
    this.x = 3;
    this.y = -2; // Start above the screen
}

// Fill the piece with a given color
Piece.prototype.fill = function(color) {
    for (let r = 0; r < this.tetromino.length; r++) {
        for (let c = 0; c < this.tetromino[r].length; c++) {
            if (this.tetromino[r][c]) {
                drawSquare(this.x + c, this.y + r, color);
            }
        }
    }
};

// Draw the piece on the board
Piece.prototype.draw = function() {
    this.fill(this.color);
};

// Undraw the piece (by drawing with the vacant color)
Piece.prototype.unDraw = function() {
    this.fill(VACANT);
};

// --- Piece Movement ---

Piece.prototype.moveDown = function() {
    if (!this.collision(0, 1, this.tetromino)) {
        this.unDraw();
        this.y++;
        this.draw();
    } else {
        this.lock();
        currentPiece = randomPiece();
    }
};

Piece.prototype.moveRight = function() {
    if (!this.collision(1, 0, this.tetromino)) {
        this.unDraw();
        this.x++;
        this.draw();
    }
};

Piece.prototype.moveLeft = function() {
    if (!this.collision(-1, 0, this.tetromino)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
};

// Rotate the piece
Piece.prototype.rotate = function() {
    // Transpose and reverse rows to get the new rotated matrix
    let nextPattern = this.tetromino.map((row, i) =>
        row.map((val, j) => this.tetromino[this.tetromino.length - 1 - j][i])
    );

    // Wall kick logic
    let kick = 0;
    if (this.collision(0, 0, nextPattern)) {
        kick = this.x > COL / 2 ? -1 : 1; // If on right, kick left, else kick right
    }

    if (!this.collision(kick, 0, nextPattern)) {
        this.unDraw();
        this.x += kick;
        this.tetromino = nextPattern;
        this.draw();
    }
};

// --- Collision Detection ---
Piece.prototype.collision = function(x, y, piece) {
    for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece[r].length; c++) {
            if (!piece[r][c]) {
                continue;
            }
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            if (newX < 0 || newX >= COL || newY >= ROW) {
                return true; // Collision with wall
            }
            if (newY < 0) {
                continue; // Ignore top boundary for spawning
            }
            if (board[newY][newX] !== VACANT) {
                return true; // Collision with another piece
            }
        }
    }
    return false;
};

// Lock the piece and check for cleared lines
Piece.prototype.lock = function() {
    for (let r = 0; r < this.tetromino.length; r++) {
        for (let c = 0; c < this.tetromino[r].length; c++) {
            if (this.tetromino[r][c]) {
                if (this.y + r < 0) {
                    // Game over condition
                    gameOver = true;
                    displayMessage("Game Over! Score: " + score);
                    startButton.style.display = "block";
                    return;
                }
                board[this.y + r][this.x + c] = this.color;
            }
        }
    }

    // Remove full rows
    let rowsCleared = 0;
    for (let r = 0; r < ROW; r++) {
        let isRowFull = true;
        for (let c = 0; c < COL; c++) {
            isRowFull = isRowFull && (board[r][c] !== VACANT);
        }
        if (isRowFull) {
            // If the row is full, move all rows above it down
            for (let y = r; y > 1; y--) {
                board[y] = board[y - 1];
            }
            board[0] = Array(COL).fill(VACANT); // Add new empty row at the top
            rowsCleared++;
        }
    }
    if(rowsCleared > 0) {
        score += rowsCleared * 10 * rowsCleared; // Add bonus for multi-line clears
        scoreDisplay.innerHTML = score;
    }

    drawBoard();
};

// --- Game Initialization and Loop ---

// Generate a new random piece
function randomPiece() {
    let r = Math.floor(Math.random() * PIECES.length);
    return new Piece(PIECES[r][0], PIECES[r][1]);
}

// Main game loop
function gameLoop() {
    if (gameOver) {
        cancelAnimationFrame(gameLoopId);
        return;
    }

    let now = Date.now();
    let delta = now - dropStart;
    if (delta > 1000) { // Drop every 1 second
        currentPiece.moveDown();
        dropStart = Date.now(); // FIX: Corrected typo from Date.Now()
    }
    gameLoopId = requestAnimationFrame(gameLoop);
}

// Initialize and start the game
function initGame() {
    // Create an empty board
    board = [];
    for (let r = 0; r < ROW; r++) {
        board[r] = Array(COL).fill(VACANT);
    }
    drawBoard();

    score = 0;
    scoreDisplay.innerHTML = score;
    gameOver = false;
    currentPiece = randomPiece();
    dropStart = Date.now();

    if (gameLoopId) {
        cancelAnimationFrame(gameLoopId);
    }
    gameLoop();
    startButton.style.display = "none";
}

// --- Event Listeners and Controls ---

// Control the piece using keyboard
function handleControl(event) {
    if (gameOver) return;

    switch (event.key) {
        case "ArrowLeft":
            currentPiece.moveLeft();
            break;
        case "ArrowRight":
            currentPiece.moveRight();
            break;
        case "ArrowUp":
            currentPiece.rotate();
            break;
        case "ArrowDown":
            currentPiece.moveDown(); // Soft drop
            break;
        case " ": // Spacebar for hard drop
            event.preventDefault();
            while (!currentPiece.collision(0, 1, currentPiece.tetromino)) {
                currentPiece.unDraw();
                currentPiece.y++;
                currentPiece.draw();
            }
            currentPiece.lock();
            currentPiece = randomPiece();
            break;
    }
}
document.addEventListener("keydown", handleControl);
startButton.addEventListener('click', initGame);

// --- UI Functions ---

// Custom message box
function displayMessage(message) {
    const messageBox = document.createElement('div');
    messageBox.className = 'message-box';
    messageBox.innerHTML = `<p>${message}</p><button class="message-box-button">OK</button>`;
    document.body.appendChild(messageBox);
    messageBox.querySelector('.message-box-button').onclick = () => {
        document.body.removeChild(messageBox);
    };
}

// Initial draw of the board on page load
drawBoard();

