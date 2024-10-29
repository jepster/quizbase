import { io } from 'socket.io-client';

const socket = io(process.env.SOCKET_URL, {
    path: '/socket.io'
});

let currentRoom = '';
let currentPlayer = '';
let lastSubmittedAnswer = null;
let currentCategory = '';
let difficulty = '';

// Socket event listeners
socket.on('connect', () => {
    console.log('Connected to server');
});

socket.on('connect_error', (error) => {
    console.error('Connection error:', error);
});

socket.on('connect_timeout', (timeout) => {
    console.error('Connection timeout:', timeout);
});

socket.on('error', (error) => {
    console.error('Socket error:', error);
});

// Socket event handlers
socket.on('playerJoined', (data) => {
    updatePlayerList(data.players);
    document.getElementById('room-id-display').textContent = `Quirky Room: ${data.roomId}`;
});

socket.on('playerReady', (players) => {
    updatePlayerList(players);
});

socket.on('selectCategory', (data) => {
    document.getElementById('waiting-room').classList.add('hidden');
    if (data.playerName === currentPlayer) {
        document.getElementById('category-selection').classList.remove('hidden');
        document.getElementById('category-selector').textContent = `${data.playerName}, select a category:`;
        const categoryButtons = document.getElementById('category-buttons');
        categoryButtons.innerHTML = data.categories.map(category =>
            `<button class="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 mr-5 rounded" onclick="window.selectCategory('${category.name}')">${category.name}</button>`
        ).join('');
    } else {
        document.getElementById('category-waiting').classList.remove('hidden');
        document.getElementById('category-waiting-message').textContent = `${data.playerName} is selecting a game category.`;
    }
});

socket.on('categorySelected', (data) => {
    document.getElementById('category-selection').classList.add('hidden');
    document.getElementById('category-waiting').classList.add('hidden');
    currentCategory = data.categoryName;
    difficulty = data.difficulty;
    const categorySelectedDiv = document.getElementById('category-selected');
    categorySelectedDiv.innerHTML = `
        <h3>🎉 Category Selected! 🎉</h3>
        <p>Get ready for some awesome ${data.categoryName} questions!</p>
    `;
    categorySelectedDiv.classList.remove('hidden');
    updateCategorySubheadline();
    setTimeout(() => {
        categorySelectedDiv.classList.add('hidden');
    }, 3000);
});

socket.on('selectDifficulty', (data) => {
    document.getElementById('category-selection').classList.add('hidden');
    if (data.playerName === currentPlayer) {
        document.getElementById('difficulty-selection').classList.remove('hidden');
        document.getElementById('difficulty-selector').textContent = `${data.playerName}, select a difficulty:`;
        const difficultyButtons = document.getElementById('difficulty-buttons');
        difficultyButtons.innerHTML = `
            <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 mr-5 rounded" onclick="window.selectDifficulty('high')">High</button>
            <button class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 mr-5 rounded" onclick="window.selectDifficulty('low')">Low</button>
        `;
    } else {
        document.getElementById('category-waiting').classList.remove('hidden');
        document.getElementById('category-waiting-message').textContent = `${data.playerName} is selecting a difficulty.`;
    }
});

socket.on('newQuestion', (data) => {
    document.getElementById('category-selection').classList.add('hidden');
    document.getElementById('category-waiting').classList.add('hidden');
    document.getElementById('category-selected').classList.add('hidden');
    document.getElementById('game').classList.remove('hidden');
    document.getElementById('question').textContent = data.question;
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = data.options.map((option, index) =>
        `<button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 mr-5 px-4 rounded" onclick="window.submitAnswer(${index})">${option}</button>`
    ).join('');
    document.getElementById('answer-status').textContent = '';
    document.getElementById('answer-reveal').classList.add('hidden');
    document.getElementById('wrong-answer').classList.add('hidden');
    document.getElementById('next-question').classList.add('hidden');
    lastSubmittedAnswer = null;
});

socket.on('answerRevealed', (data) => {
    const answerRevealDiv = document.getElementById('answer-reveal');
    answerRevealDiv.innerHTML = `
        <h3>Correct Answer: ${data.options[data.correctIndex]}</h3>
        <p>Explanation: ${data.explanation}</p>
    `;
    answerRevealDiv.classList.remove('hidden');

    if (lastSubmittedAnswer !== null && lastSubmittedAnswer !== data.correctIndex) {
        const wrongAnswerDiv = document.getElementById('wrong-answer');
        const funnyMessages = [
            "Oopsie-daisy! That answer was as wrong as putting pineapple on pizza!",
            "Holy guacamole! Your answer was so off, it's probably vacationing in Narnia!",
            "Yikes! That answer was more off-target than a blindfolded archer!",
            "Oh snap! Your answer just took a wrong turn at Albuquerque!",
            "Great Scott! Your answer was more mixed up than a chameleon in a bag of Skittles!"
        ];
        const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
        wrongAnswerDiv.textContent = randomMessage;
        wrongAnswerDiv.classList.remove('hidden');
    }

    updateLeaderboard(data.leaderboard);
    document.getElementById('next-question').classList.remove('hidden');
});

socket.on('gameEnded', (data) => {
    document.getElementById('game').classList.add('hidden');
    document.getElementById('results').classList.remove('hidden');
    updateFinalLeaderboard(data.leaderboard);
    const resultsDiv = document.getElementById('final-results');
    resultsDiv.innerHTML = data.results.map(q =>
        `<div>
            <h4>${q.question}</h4>
            <p>Correct Answer: ${q.options[q.correctIndex]}</p>
            <p>Explanation: ${q.explanation}</p>
        </div>`
    ).join('');
});

socket.on('newGameStarted', (players) => {
    document.getElementById('results').classList.add('hidden');
    document.getElementById('waiting-room').classList.remove('hidden');
    updatePlayerList(players);
});

// Functions
window.createRoom = function() {
    socket.emit('createRoom', (roomId) => {
        currentRoom = roomId;
        document.getElementById('room-id').value = roomId;
    });
};

window.joinRoom = function() {
    const roomId = document.getElementById('room-id').value;
    const playerName = document.getElementById('player-name').value;
    currentPlayer = playerName;
    socket.emit('joinRoom', { roomId, playerName });
    currentRoom = roomId;
    document.getElementById('room-creation').classList.add('hidden');
    document.getElementById('waiting-room').classList.remove('hidden');
};

window.playerReady = function() {
    socket.emit('playerReady', currentRoom);
};

window.submitAnswer = function(index) {
    lastSubmittedAnswer = index;
    socket.emit('submitAnswer', { roomId: currentRoom, answerIndex: index });
    document.getElementById('answer-status').textContent = 'Answer submitted. Waiting for other players...';
    document.getElementById('options').innerHTML = '';
};

window.readyForNextQuestion = function() {
    socket.emit('readyForNextQuestion', currentRoom);
    document.getElementById('next-question').classList.add('hidden');
};

window.startNewGame = function() {
    socket.emit('startNewGame', currentRoom);
};

window.selectCategory = function(categoryName) {
    socket.emit('categorySelected', { roomId: currentRoom, categoryName });
    document.getElementById('category-selection').classList.add('hidden');
};

window.selectDifficulty = function(difficulty) {
    socket.emit('difficultySelected', { roomId: currentRoom, difficulty: difficulty });
    document.getElementById('difficulty-selection').classList.add('hidden');
};

// Helper functions
function updatePlayerList(players) {
    const playerList = document.getElementById('player-list');
    playerList.innerHTML = players.map(p =>
        `<li class="bg-orange-100 p-2 mt-2 mb-2 rounded-lg">${p.name} ${p.ready ? '✔️ (Ready to Rock!)' : ''}</li>`
    ).join('');
}

function updateLeaderboard(leaderboard) {
    const leaderboardDiv = document.getElementById('leaderboard');
    const sortedLeaderboard = leaderboard.sort((a, b) => b.score - a.score);
    leaderboardDiv.innerHTML = '<h3>Leaderboard of Legends</h3>' +
        sortedLeaderboard.map(p => `<p>${p.name}: ${p.score} points</p>`).join('');
}

function updateFinalLeaderboard(leaderboard) {
    const finalLeaderboardDiv = document.getElementById('final-leaderboard');
    const sortedLeaderboard = leaderboard.sort((a, b) => b.score - a.score);
    const winner = sortedLeaderboard[0];
    finalLeaderboardDiv.innerHTML = `
        <h3>Final Leaderboard</h3>
        <p class="winner">🏆 Winner: ${winner.name} with ${winner.score} points! 🏆</p>
        ${sortedLeaderboard.slice(1).map(p => `<p>${p.name}: ${p.score} points</p>`).join('')}
    `;
}

function updateCategorySubheadline() {
    const subheadline = document.getElementById('category-subheadline');
    subheadline.textContent = `Category: ${currentCategory}`;
    subheadline.classList.remove('hidden');

    const difficultySubheadline = document.getElementById('difficulty-subheadline');
    difficultySubheadline.textContent = `Difficulty: ${difficulty}`;
    difficultySubheadline.classList.remove('hidden');
}
