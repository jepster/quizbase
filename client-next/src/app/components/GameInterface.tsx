import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import ErrorModal from "@/app/components/ErrorModal";

interface GameInterfaceProps {
  socket: Socket | null;
}

export default function GameInterface({ socket }: GameInterfaceProps) {
  const [gameState, setGameState] = useState<string>('start');
  const [room, setRoom] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [players, setPlayers] = useState<Array<{ name: string; ready: boolean }>>([]);
  const [question, setQuestion] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [answers, setAnswers] = useState<string[]>([]);
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [leaderboard, setLeaderboard] = useState<Array<{ name: string; score: number; lastQuestionCorrect: boolean }>>([]);

  const gameStates = {
    start: 'start',
    roomCreation: 'room-creation',
    waitingRoom: 'waiting-room',
    categorySelection: 'category-selection',
    categorySelectionWaiting: 'category-selection-waiting',
    selectDifficulty: 'select-difficulty',
    selectDifficultyWaiting: 'select-difficulty-waiting',
    game: 'game',
    results: 'results'
  };

  useEffect(() => {
    if (socket) {
      socket.on('playerJoined', handlePlayerJoined);
      socket.on('playerReady', handlePlayerReady);
      socket.on('selectCategory', handleSelectCategory);
      socket.on('categorySelected', handleCategorySelected);
      socket.on('selectDifficulty', handleSelectDifficulty);
      socket.on('newQuestion', handleNewQuestion);
      socket.on('answerRevealed', handleAnswerRevealed);
      socket.on('gameEnded', handleGameEnded);
      socket.on('newGameStarted', handleNewGameStarted);

      return () => {
        socket.off('playerJoined', handlePlayerJoined);
        socket.off('playerReady', handlePlayerReady);
        socket.off('selectCategory', handleSelectCategory);
        socket.off('categorySelected', handleCategorySelected);
        socket.off('selectDifficulty', handleSelectDifficulty);
        socket.off('newQuestion', handleNewQuestion);
        socket.off('answerRevealed', handleAnswerRevealed);
        socket.off('gameEnded', handleGameEnded);
        socket.off('newGameStarted', handleNewGameStarted);
      };
    }
  }, [socket, playerName]);

  const handlePlayerJoined = (data: { player: string, players: Array<{ name: string; ready: boolean }> }) => {
    if (playerName !== data.player) {
      showNotification('Benachrichtigung', `${data.player} ist dem Raum beigetreten.`);
    }
    setPlayers(data.players);
    setGameState(gameStates.waitingRoom);
  };

  const handlePlayerReady = (data: { players: Array<{ name: string; ready: boolean }> }) => {
    setPlayers(data.players);
  };

  const handleSelectCategory = (data: { playerName: string, categories: string[] }) => {
    if (data.playerName === playerName) {
      setGameState(gameStates.categorySelection);
      setCategories(data.categories);
    } else {
      setGameState(gameStates.categorySelectionWaiting);
    }
  };

  const handleCategorySelected = (data: { categoryName: string, difficulty: string }) => {
    setCategory(data.categoryName);
    setDifficulty(data.difficulty);
    setGameState(gameStates.waitingRoom);
  };

  const handleSelectDifficulty = (data: { playerName: string }) => {
    if (data.playerName === playerName) {
      setGameState(gameStates.selectDifficulty);
    } else {
      setGameState(gameStates.selectDifficultyWaiting);
    }
  };

  const handleNewQuestion = (data: { question: string; options: string[] }) => {
    setQuestion(data.question);
    setOptions(data.options);
    setGameState(gameStates.game);
    setLastSubmittedAnswer(null);
  };

  const handleAnswerRevealed = (data: { options: string[], correctIndex: number, explanation: string, leaderboard: Array<{ name: string; score: number; lastQuestionCorrect: boolean }> }) => {
    setLeaderboard(data.leaderboard);
  };

  const handleGameEnded = (data: { leaderboard: Array<{ name: string; score: number; lastQuestionCorrect: boolean }>, results: Array<{ question: string, options: string[], correctIndex: number, explanation: string }> }) => {
    setLeaderboard(data.leaderboard);
    setGameState(gameStates.results);
  };

  const handleNewGameStarted = (players: Array<{ name: string; ready: boolean }>) => {
    setPlayers(players);
    setGameState(gameStates.waitingRoom);
  };

  const showNotification = (title: string, body: string) => {
    if (Notification.permission === "granted") {
      new Notification(title, { body, icon: "bell_icon.png" });
    } else if (Notification.permission !== "denied") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, { body, icon: "bell_icon.png" });
        }
      });
    }
  };

  const createRoom = () => {
    if (playerName === '') {
      showError('Es muss ein Name eingegeben werden.');
      return;
    }
    if (socket) {
      socket.emit('createRoom', (roomId: string) => {
        setRoom(roomId);
        socket.emit('joinRoom', { roomId, playerName });
      });
    }
  };

  const joinRoom = () => {
    if (playerName === '') {
      showError('Es muss ein Name eingegeben werden.');
      return;
    }
    if (socket) {
      socket.emit('joinRoom', { roomId: room, playerName });
    }
  };

  const playerReady = () => {
    socket?.emit('playerReady', { currentRoom: room, currentPlayer: playerName });
  };

  const selectCategory = (category: string) => {
    socket?.emit('categorySelected', { roomId: room, categoryName: category });
  };

  const selectDifficulty = (difficulty: string) => {
    socket?.emit('difficultySelected', { roomId: room, difficulty });
  };

  const submitAnswer = (index: number) => {
    setLastSubmittedAnswer(index.toString());
    socket?.emit('submitAnswer', { roomId: room, answerIndex: index, currentPlayer: playerName });
  };

  const readyForNextQuestion = () => {
    socket?.emit('readyForNextQuestion', room);
  };

  const startNewGame = () => {
    socket?.emit('startNewGame', room);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setIsModalOpen(true);
  };

  return (
    <div>
      <ErrorModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} errorMessage={errorMessage} />

      {gameState === gameStates.start && (
        <div>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded" onClick={() => setGameState(gameStates.roomCreation)}>Quiz erstellen</button>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold my-5 py-2 px-4 rounded" onClick={() => setGameState(gameStates.waitingRoom)}>Quiz beitreten</button>
        </div>
      )}

      {gameState === gameStates.roomCreation && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Quiz erstellen</h2>
          <input
            className="w-full p-2 mt-2 mb-2 border-2 border-pink-500 rounded"
            placeholder="Dein Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded" onClick={createRoom}>Raum erstellen</button>
        </div>
      )}

      {gameState === gameStates.waitingRoom && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Warteraum</h2>
          <h3 className="text-xl font-bold mb-2">Raumname: {room}</h3>
          <ul className="list-none p-0">
            {players.map((player, index) => (
              <li key={index} className="bg-orange-100 p-2 mt-2 mb-2 rounded-lg">
                {player.name} {player.ready ? '✔️' : ''}
              </li>
            ))}
          </ul>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded" onClick={playerReady}>Bereit</button>
        </div>
      )}

      {gameState === gameStates.categorySelection && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Wähle eine Kategorie</h2>
          <p className="text-xl font-bold mb-2">{playerName}, wähle eine Kategorie:</p>
          <div className="flex flex-wrap justify-center">
            {categories.map((cat, index) => (
              <button key={index} className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 m-2 rounded" onClick={() => selectCategory(cat)}>{cat}</button>
            ))}
          </div>
        </div>
      )}

      {gameState === gameStates.categorySelectionWaiting && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Warte auf Kategorieauswahl</h2>
        </div>
      )}

      {gameState === gameStates.selectDifficulty && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Wähle den Schwierigkeitsgrad</h2>
          <p className="text-xl font-bold mb-2">{playerName}, deine Auswahl:</p>
          <div className="flex flex-wrap justify-center">
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 m-2 rounded" onClick={() => selectDifficulty('high')}>Schwer</button>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 m-2 rounded" onClick={() => selectDifficulty('low')}>Leicht</button>
          </div>
        </div>
      )}

      {gameState === gameStates.selectDifficultyWaiting && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Warte auf Schwierigkeitsauswahl</h2>
        </div>
      )}

      {gameState === gameStates.game && (
        <div>
          <h2 className="text-2xl font-bold mb-4">{question}</h2>
          <div className="flex flex-wrap justify-center">
            {options.map((option, index) => (
              <button
                key={index}
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-2 rounded ${lastSubmittedAnswer === index.toString() ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => submitAnswer(index)}
                disabled={lastSubmittedAnswer !== null}
              >
                {option}
              </button>
            ))}
          </div>
          {lastSubmittedAnswer !== null && (
            <p className="text-xl font-bold mt-4">Antwort gesendet. Warte auf andere Spieler...</p>
          )}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-2">Punktestand</h3>
            {leaderboard.map((player, index) => (
              <p key={index}>{player.name}: {player.score} Punkte - letzte Antwort korrekt: {player.lastQuestionCorrect ? '✅' : '❌'}</p>
            ))}
          </div>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded mt-4" onClick={readyForNextQuestion}>Nächste Frage</button>
        </div>
      )}

      {gameState === gameStates.results && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Spielergebnisse</h2>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">Endstand</h3>
            {leaderboard.map((player, index) => (
              <p key={index}>{player.name}: {player.score} Punkte</p>
            ))}
          </div>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded" onClick={startNewGame}>Neues Spiel starten</button>
        </div>
      )}
    </div>
  );
}
