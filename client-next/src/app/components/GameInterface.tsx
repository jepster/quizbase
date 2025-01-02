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
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [leaderboard, setLeaderboard] = useState<Array<{ name: string; score: number; lastQuestionCorrect: boolean }>>([]);
  const [results, setResults] = useState<Array<{ question: string, options: string[], correctIndex: number, explanation: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [roomId, setRoomId] = useState<string>('');
  const [explanation, setExplanation] = useState<string>('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);

  const gameStates = {
    start: 'start',
    roomCreation: 'room-creation',
    waitingRoom: 'waiting-room',
    categorySelection: 'category-selection',
    categorySelectionWaiting: 'category-selection-waiting',
    selectDifficulty: 'select-difficulty',
    selectDifficultyWaiting: 'select-difficulty-waiting',
    game: 'game',
    results: 'results',
    categoryCreation: 'category-creation',
    roomJoin: 'room-join',
  };

  useEffect(() => {
    if (socket) {
      socket.on('playerJoined', handlePlayerJoined);
      socket.on('playerReady', handlePlayerReady);
      socket.on('selectCategory', handleSelectCategory);
      socket.on('selectDifficulty', handleSelectDifficulty);
      socket.on('newQuestion', handleNewQuestion);
      socket.on('answerRevealed', handleAnswerRevealed);
      socket.on('gameEnded', handleGameEnded);
      socket.on('newGameStarted', handleNewGameStarted);
      socket.on('gameEnded', (data) => {
        setLeaderboard(data.leaderboard);
        setResults(data.results);
        setGameState(gameStates.results);
      });
      socket.on('categoryCreated', () => {
        setIsLoading(false);
        setGameState(gameStates.start);
      });

      return () => {
        socket.off('playerJoined', handlePlayerJoined);
        socket.off('playerReady', handlePlayerReady);
        socket.off('selectCategory', handleSelectCategory);
        socket.off('selectDifficulty', handleSelectDifficulty);
        socket.off('newQuestion', handleNewQuestion);
        socket.off('answerRevealed', handleAnswerRevealed);
        socket.off('gameEnded', handleGameEnded);
        socket.off('newGameStarted', handleNewGameStarted);
        socket.off('gameEnded');
        socket.off('categoryCreated');
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
    const allPlayersReady = data.players.every(player => player.ready);
    if (allPlayersReady) {
      setGameState(gameStates.categorySelection);
    }
  };

  const handleSelectCategory = (data: { playerName: string, categories: string[] }) => {
    if (data.playerName === playerName) {
      setGameState(gameStates.categorySelection);
      setCategories(data.categories);
    } else {
      setGameState(gameStates.categorySelectionWaiting);
    }
  };

  const handleSelectDifficulty = (data: { playerName: string, categoryName: string, difficulty: string }) => {
    setCategory(data.categoryName);
    if (data.playerName === playerName) {
      setGameState(gameStates.selectDifficulty);
    } else {
      setGameState(gameStates.selectDifficultyWaiting);
    }
  };

  const handleNewQuestion = (data: { question: string; options: string[], totalQuestionsCount: number, difficulty: string}) => {
    setQuestion(data.question);
    setOptions(data.options);
    setGameState(gameStates.game);
    setLastSubmittedAnswer(null);
    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    setTotalQuestions(data.totalQuestionsCount);
    setDifficulty(data.difficulty);
    setIsAnswerCorrect(false);
  };

  const handleAnswerRevealed = (data: { options: string[], correctIndex: number, explanation: string, leaderboard: Array<{ name: string; score: number; lastQuestionCorrect: boolean }> }) => {
    setExplanation(data.explanation);
    if (data.leaderboard[0].lastQuestionCorrect) {
      setIsAnswerCorrect(true);
    }
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
    if (socket && roomId) {
      socket.emit('joinRoom', { roomId, playerName });
      setRoom(roomId);
      setGameState(gameStates.waitingRoom);
    }
  };

  const playerReady = () => {
    socket?.emit('playerReady', { room, playerName });
  };

  const selectCategory = (category: string) => {
    socket?.emit('categorySelected', { roomId: room, categoryName: category });
  };

  const selectDifficulty = (difficulty: string) => {
    socket?.emit('difficultySelected', { roomId: room, difficulty });
  };

  const submitAnswer = (index: number) => {
    setLastSubmittedAnswer(index);
    socket?.emit('submitAnswer', { roomId: room, answerIndex: index, currentPlayer: playerName });
    setAnswerSubmitted(true);
  };

  const readyForNextQuestion = () => {
    socket?.emit('readyForNextQuestion', room);
    setAnswerSubmitted(false);
  };

  const startNewGame = () => {
    socket?.emit('startNewGame', room);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setIsModalOpen(true);
  };

  const createCategory = () => {
    if (newCategoryName.trim() === '') {
      showError('Bitte gib einen Kategorienamen ein.');
      return;
    }
    setIsLoading(true);
    socket?.emit('createRoomByCustomCategory', { categoryName: newCategoryName });
  };

  return (
    <div>
      <ErrorModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} errorMessage={errorMessage} />

      {gameState === gameStates.start && (
        <div>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded m-2" onClick={() => setGameState(gameStates.roomCreation)}>Quiz erstellen</button>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold my-5 py-2 px-4 rounded m-2" onClick={() => setGameState(gameStates.roomJoin)}>Quiz beitreten</button>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold my-5 py-2 px-4 rounded m-2" onClick={() => setGameState(gameStates.categoryCreation)}>Kategorie erstellen</button>
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
          <h3>{category} ({difficulty === 'low' ? 'leicht' : 'schwer'})</h3>
          <h2 className="text-2xl font-bold mb-4">
            Frage {currentQuestionIndex}/{totalQuestions}: {question}
          </h2>
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
            <>
              {!isAnswerCorrect && (
                <div className="text-xl font-bold mb-2 bg-red-500 text-white p-4 rounded-lg">{explanation}</div>
              )}
              {isAnswerCorrect && (
                <div className="text-xl font-bold mb-2 bg-green-500 text-white p-4 rounded-lg">{explanation}</div>
              )}
              <p className="text-xl font-bold mt-4">Antwort gesendet. Warte auf andere Spieler...</p>
            </>
          )}
          <div className="mt-8">
            <h3 className="text-xl font-bold mb-2">Punktestand</h3>
            {leaderboard.map((player, index) => (
              <p key={index}>{player.name}: {player.score} Punkte - letzte Antwort
                korrekt: {player.lastQuestionCorrect ? '✅' : '❌'}</p>
            ))}
          </div>
          <button
            className={`bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded mt-4 ${!answerSubmitted ? 'opacity-50 cursor-not-allowed' : ''}\``}
            onClick={readyForNextQuestion}
            disabled={!answerSubmitted}
          >Nächste Frage
          </button>
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

      {gameState === gameStates.results && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Spielergebnisse</h2>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">Endstand</h3>
            {leaderboard.map((player, index) => (
              <p key={index}>{player.name}: {player.score} Punkte</p>
            ))}
          </div>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">Fragen und Antworten</h3>
            {results.map((result, index) => (
              <div key={index} className={`${index % 2 === 0 ? 'bg-green-100' : 'bg-red-100'} p-4 m-2 rounded-lg`}>
                <h4 className="font-bold mb-2">{result.question}</h4>
                <p className="font-semibold">Richtige Antwort: {result.options[result.correctIndex]}</p>
                <p className="mt-2">Erklärung: {result.explanation}</p>
              </div>
            ))}
          </div>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded" onClick={startNewGame}>Neues Spiel starten</button>
        </div>
      )}

      {gameState === gameStates.categoryCreation && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Kategorie erstellen</h2>
          <input
            className="w-full p-2 mt-2 mb-2 border-2 border-pink-500 rounded"
            placeholder="Kategoriename"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
          <button
            className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
            onClick={createCategory}
            disabled={isLoading}
          >
            {isLoading ? 'Wird erstellt...' : 'Erstellen'}
          </button>
        </div>
      )}

      {gameState === gameStates.roomJoin && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Raum beitreten</h2>
          <input
            className="w-full p-2 mt-2 mb-2 border-2 border-pink-500 rounded"
            placeholder="Raum ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
          <input
            className="w-full p-2 mt-2 mb-2 border-2 border-pink-500 rounded"
            placeholder="Dein Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button
            className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
            onClick={joinRoom}
          >
            Party beitreten
          </button>
        </div>
      )}


      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      )}
    </div>
  );
}
