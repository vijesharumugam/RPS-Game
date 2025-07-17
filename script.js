// Game state
let score = JSON.parse(localStorage.getItem('score')) || { wins: 0, losses: 0, ties: 0 };
let isAutoPlay = false;
let intervalID;
let currentRound = 1;
let gameMode = 'casual';
let moveHistory = [];
let playerName = 'Player';
let isAnimating = false;

// Sound effects
const moveSound = document.getElementById('moveSound');
const winSound = document.getElementById('winSound');
const loseSound = document.getElementById('loseSound');

// Initialize UI
document.addEventListener('DOMContentLoaded', () => {
    updateScore();
    updatePlayerName();
    loadPreferences();
    addButtonEffects();
});

// Dark mode toggle
const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const icon = darkModeToggle.querySelector('i');
    icon.classList.toggle('fa-moon');
    icon.classList.toggle('fa-sun');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
});

// Player name input with validation
const playerNameInput = document.getElementById('playerName');
playerNameInput.addEventListener('input', (e) => {
    const value = e.target.value.trim();
    if (value.length > 20) {
        e.target.value = value.substring(0, 20);
    }
});

playerNameInput.addEventListener('change', (e) => {
    const value = e.target.value.trim();
    playerName = value || 'Player';
    localStorage.setItem('playerName', playerName);
    updatePlayerName();
    showToast(`Name updated to: ${playerName}`);
});

// Game mode selection with animation
const gameModeButtons = document.querySelectorAll('.mode-btn');
gameModeButtons.forEach(button => {
    button.addEventListener('click', () => {
        if (button.classList.contains('active')) return;
        
        gameModeButtons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        gameMode = button.dataset.mode;
        
        // Animate the change
        const results = document.querySelector('.results');
        results.style.opacity = '0';
        setTimeout(() => {
            reset();
            results.style.opacity = '1';
            showToast(`Game mode changed to: ${button.textContent}`);
        }, 300);
    });
});

// Button effects
function addButtonEffects() {
    const buttons = document.querySelectorAll('.btn button');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', () => {
            if (!isAnimating) {
                moveSound.currentTime = 0;
                moveSound.volume = 0.2;
                moveSound.play();
            }
        });
    });
}

// Toast notification system
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove toast after animation
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function loadPreferences() {
    // Load dark mode preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
    }
    
    // Load player name
    if (localStorage.getItem('playerName')) {
        playerName = localStorage.getItem('playerName');
        playerNameInput.value = playerName;
        updatePlayerName();
    }
}

function updatePlayerName() {
    const playerMoveDiv = document.querySelector('.player-move h3');
    if (playerMoveDiv) {
        playerMoveDiv.textContent = playerName;
    }
}

function updateScore() {
    // Update individual score items
    document.getElementById('winScore').textContent = score.wins;
    document.getElementById('lossScore').textContent = score.losses;
    document.getElementById('tieScore').textContent = score.ties;
    
    // Update round number
    document.getElementById('roundNumber').textContent = currentRound;
    
    // Calculate and update win rate
    const totalGames = score.wins + score.losses + score.ties;
    const winRate = totalGames > 0 ? ((score.wins / totalGames) * 100).toFixed(1) : '0';
    document.getElementById('winRate').textContent = `${winRate}%`;
    
    // Calculate longest streak
    const longestStreak = calculateLongestStreak();
    document.getElementById('longestStreak').textContent = longestStreak;
}

function calculateLongestStreak() {
    let currentStreak = 0;
    let maxStreak = 0;
    let lastResult = null;
    
    moveHistory.forEach(move => {
        if (move.result === 'you win') {
            if (lastResult === 'you win') {
                currentStreak++;
            } else {
                currentStreak = 1;
            }
            maxStreak = Math.max(maxStreak, currentStreak);
        } else {
            currentStreak = 0;
        }
        lastResult = move.result;
    });
    
    return maxStreak;
}

function updateMoveHistory(playerMove, computerMove, result) {
    moveHistory.unshift({ playerMove, computerMove, result, round: currentRound });
    if (moveHistory.length > 10) moveHistory.pop();
    
    const historyHTML = moveHistory.map(move => `
        <div class="history-item ${move.result.replace(' ', '-')}">
            <div class="move-info">
                <span class="round-badge">Round ${move.round}</span>
                <div class="moves">
                    <img src="${move.playerMove.toLowerCase()}-emoji.png" alt="${move.playerMove}" class="move-icon">
                    <span class="versus">vs</span>
                    <img src="${move.computerMove.toLowerCase()}-emoji.png" alt="${move.computerMove}" class="move-icon">
                </div>
            </div>
            <span class="result-badge ${move.result.replace(' ', '-')}">${move.result}</span>
        </div>
    `).join('');
    
    const historyList = document.getElementById('moveHistory');
    historyList.innerHTML = historyHTML;
    
    // Animate new entry
    const newEntry = historyList.firstElementChild;
    if (newEntry) {
        newEntry.style.opacity = '0';
        newEntry.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            newEntry.style.opacity = '1';
            newEntry.style.transform = 'translateX(0)';
        }, 50);
    }
    
    // Update stats
    updateScore();
}

function comMove() {
    const moves = ['Rock', 'Paper', 'Scissor'];
    return moves[Math.floor(Math.random() * moves.length)];
}

function playSound(result) {
    const sound = result === 'you win' ? winSound :
                 result === 'you lose' ? loseSound :
                 moveSound;
    
    sound.currentTime = 0;
    sound.volume = 0.3;
    sound.play();
}

function checkGameEnd() {
    if (gameMode === 'casual') return false;
    
    const targetWins = gameMode === 'best-of-3' ? 2 : 3;
    if (score.wins >= targetWins || score.losses >= targetWins) {
        const winner = score.wins >= targetWins ? playerName : 'Computer';
        setTimeout(() => {
            showToast(`Game Over! ${winner} wins the ${gameMode} match!`);
            reset();
        }, 500);
        return true;
    }
    return false;
}

async function RPS(playerMove) {
    if (isAnimating || checkGameEnd()) return;
    
    isAnimating = true;
    const button = document.querySelector(`#${playerMove.toLowerCase()}`);
    button.classList.add('loading');
    
    // Add loading state
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const computerMove = comMove();
    let result = '';

    if (playerMove === computerMove) {
        result = 'Tie';
    } else if (
        (playerMove === 'Rock' && computerMove === 'Scissor') ||
        (playerMove === 'Paper' && computerMove === 'Rock') ||
        (playerMove === 'Scissor' && computerMove === 'Paper')
    ) {
            result = 'you win';
    } else {
        result = 'you lose';
    }

    // Update score
    if (result === 'you win') {
        score.wins += 1;
    } else if (result === 'you lose') {
        score.losses += 1;
    } else {
        score.ties += 1;
    }

    // Play sound effect
    playSound(result);

    // Save score and update UI
    localStorage.setItem('score', JSON.stringify(score));
    updateScore();
    
    // Update result display with animation
    const resultsDisplay = document.querySelector(".results");
    resultsDisplay.style.opacity = '0';
    resultsDisplay.className = 'results ' + result.replace(' ', '-');
    
    setTimeout(() => {
        resultsDisplay.textContent = result;
        resultsDisplay.style.opacity = '1';
    }, 200);
    
    // Update move display with animation
    const handDisplay = document.querySelector(".hand");
    handDisplay.style.opacity = '0';
    
    setTimeout(() => {
        handDisplay.innerHTML = `
            <div class="player-move">
                <h3>${playerName}</h3>
                <img src="${playerMove}-emoji.png" alt="${playerMove}">
            </div>
            <div class="computer-move">
                <h3>Computer</h3>
                <img src="${computerMove}-emoji.png" alt="${computerMove}">
            </div>`;
        handDisplay.style.opacity = '1';
    }, 200);

    // Update move history
    updateMoveHistory(playerMove, computerMove, result);
    
    // Increment round counter
    currentRound++;
    
    // Remove loading state
    button.classList.remove('loading');
    isAnimating = false;
    
    // Check for game end
    checkGameEnd();
}

function reset() {
    score.wins = 0;
    score.losses = 0;
    score.ties = 0;
    currentRound = 1;
    moveHistory = [];
    localStorage.removeItem('score');
    
    // Animate the reset
    const elements = [
        document.querySelector(".results"),
        document.querySelector(".hand"),
        document.querySelector(".score"),
        document.getElementById('moveHistory'),
        document.getElementById('winRate'),
        document.getElementById('longestStreak')
    ];
    
    elements.forEach(el => {
        if (el) el.style.opacity = '0';
    });
    
    setTimeout(() => {
    updateScore();
        document.querySelector(".results").innerHTML = 'Choose your move!';
        document.querySelector(".hand").innerHTML = `
            <div class="player-move">
                <h3>${playerName}</h3>
                <img src="Rock-emoji.png" alt="Rock">
            </div>
            <div class="computer-move">
                <h3>Computer</h3>
                <img src="Rock-emoji.png" alt="Rock">
            </div>`;
        document.getElementById('moveHistory').innerHTML = '';
        
        elements.forEach(el => {
            if (el) el.style.opacity = '1';
        });
        
        showToast('Game reset! Start a new game.');
    }, 300);
}

function AutoPlay() {
    const autoPlayButton = document.querySelector('.autoplay-btn');
    if (!isAutoPlay) {
        intervalID = setInterval(() => {
            if (!isAnimating) {
                const moves = ['Rock', 'Paper', 'Scissor'];
                const playerMove = moves[Math.floor(Math.random() * moves.length)];
                RPS(playerMove);
            }
        }, 1500);
        isAutoPlay = true;
        autoPlayButton.innerHTML = '<i class="fas fa-stop"></i> Stop AutoPlay';
        showToast('AutoPlay started');
    } else {
        clearInterval(intervalID);
        isAutoPlay = false;
        autoPlayButton.innerHTML = '<i class="fas fa-robot"></i> AutoPlay';
        showToast('AutoPlay stopped');
    }
}

// Add CSS for toast notifications
const style = document.createElement('style');
style.textContent = `
    .toast {
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background: var(--primary-color);
        color: white;
        padding: 1rem 2rem;
        border-radius: 12px;
        font-weight: 600;
        opacity: 0;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    }
    
    .toast.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
`;
document.head.appendChild(style);