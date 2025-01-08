import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import ErrorModal from "@/app/components/ErrorModal";

interface GameInterfaceProps {
  socket: Socket | null;
  gameState: string;
  roomId: string;
  setGameState: React.Dispatch<React.SetStateAction<string>>;
  setRoomId: React.Dispatch<React.SetStateAction<string>>;
  resetGame: () => void;
}

export default function GameInterface({ socket, gameState, setGameState, setRoomId, roomId }: GameInterfaceProps) {
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
  const [leaderboard, setLeaderboard] = useState<Array<{ name: string; score: number; lastQuestionCorrect: boolean }>>([]);
  const [results, setResults] = useState<Array<{ question: string, options: string[], correctIndex: number, explanation: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<string>('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);
  const [copyToClipboardLabel, setCopyToClipboardLabel] = useState<string>('Link kopieren');
  const [allPlayersAnsweredQuestion, setAllPlayersAnsweredQuestion] = useState<boolean>(false);

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
    roomJoinByLink: 'room-join-by-link',
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
    setAllPlayersAnsweredQuestion(false);
  };

  const handleAnswerRevealed = (data: { options: string[], correctIndex: number, explanation: string, allPlayersAnsweredQuestion: boolean, leaderboard: Array<{ name: string; score: number; lastQuestionCorrect: boolean }> }) => {
    setExplanation(data.explanation);
    if (data.leaderboard[0].lastQuestionCorrect) {
      setIsAnswerCorrect(true);
    }
    setLeaderboard(data.leaderboard);
    setAllPlayersAnsweredQuestion(data.allPlayersAnsweredQuestion);
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
        setRoomId(roomId);
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
      socket.emit('joinRoom', { roomId: roomId, playerName });
      setRoomId(roomId);
      setGameState(gameStates.waitingRoom);
    }
  };

  const playerReady = () => {
    socket?.emit('playerReady', { roomId: roomId, playerName });
  };

  const selectCategory = (category: string) => {
    socket?.emit('categorySelected', { roomId: roomId, categoryName: category });
  };

  const selectDifficulty = (difficulty: string) => {
    socket?.emit('difficultySelected', { roomId: roomId, difficulty });
  };

  const submitAnswer = (index: number) => {
    setLastSubmittedAnswer(index);
    socket?.emit('submitAnswer', { roomId: roomId, answerIndex: index, currentPlayer: playerName });
    setAnswerSubmitted(true);
  };

  const readyForNextQuestion = () => {
    socket?.emit('readyForNextQuestion', roomId);
    setAnswerSubmitted(false);
  };

  const startNewGame = () => {
    socket?.emit('startNewGame', roomId);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setIsModalOpen(true);
  };

  const createCategory = () => {
    if (category.trim() === '') {
      showError('Bitte gib einen Kategorienamen ein.');
      return;
    }
    setIsLoading(true);
    socket?.emit('createCustomCategory', { category: category });
  };

  const shareOnWhatsApp = () => {
    const currentDomain = window.location.origin;
    const shareUrl = `${currentDomain}?roomId=${roomId}`;
    const encodedShareUrl = encodeURIComponent(shareUrl);

    const whatsappUrl = `https://wa.me/?text=Join%20my%20quiz%20game!%20${encodedShareUrl}`;

    window.open(whatsappUrl, '_blank');
  }

  const copyToClipboard = () => {
    const currentDomain = window.location.origin;
    const shareUrl = `${currentDomain}?roomId=${roomId}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          setCopyToClipboardLabel('Link kopiert');
          setTimeout(() => setCopyToClipboardLabel('Link kopieren'), 2000);
        })
        .catch((err) => {
          console.error('Failed to copy text: ', err);
          fallbackCopyTextToClipboard(shareUrl);
        });
    } else {
      fallbackCopyTextToClipboard(shareUrl);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand('copy');
      const msg = successful ? 'successful' : 'unsuccessful';
      console.log('Fallback: Copying text command was ' + msg);
      setCopyToClipboardLabel('Link kopiert');
      setTimeout(() => setCopyToClipboardLabel('Link kopieren'), 2000);
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err);
      setCopyToClipboardLabel('Kopieren fehlgeschlagen');
      setTimeout(() => setCopyToClipboardLabel('Link kopieren'), 2000);
    }

    document.body.removeChild(textArea);
  };


  return (
    <>
      <ErrorModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} errorMessage={errorMessage} />

      {gameState === gameStates.start && (
        <>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded m-2" onClick={() => setGameState(gameStates.roomCreation)}>Quiz erstellen</button>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold my-5 py-2 px-4 rounded m-2" onClick={() => setGameState(gameStates.roomJoin)}>Quiz beitreten</button>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold my-5 py-2 px-4 rounded m-2" onClick={() => setGameState(gameStates.categoryCreation)}>Kategorie erstellen</button>
        </>
      )}

      {gameState === gameStates.roomCreation && (
        <>
          <h2 className="text-2xl font-bold mb-4">Quiz erstellen</h2>
          <input
            className="w-full p-2 mt-2 mb-2 border-2 border-pink-500 rounded"
            placeholder="Dein Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded" onClick={createRoom}>Raum erstellen</button>
        </>
      )}

      {gameState === gameStates.waitingRoom && (
        <>
          <h2 className="text-2xl font-bold mb-4">Warteraum</h2>
          <h3 className="text-xl font-bold mb-2">Raumname: {roomId}</h3>
          <ul className="list-none p-0">
            {players.map((player, index) => (
              <li key={index} className="bg-orange-100 p-2 mt-2 mb-2 rounded-lg">
                {player.name} {player.ready ? '✔️' : ''}
              </li>
            ))}
          </ul>
          <button onClick={shareOnWhatsApp} id="whatsapp-share"
                  className="w-64 flex-shrink-0 justify-center bg-green-500 hover:bg-green-700 text-white mt-5 mb-2 py-2 px-4 rounded flex items-center">
            <svg className="w-5 h-5 mr-2 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Auf WhatsApp teilen
          </button>
          <button onClick={copyToClipboard} id="copyButton"
                  className="w-64 flex-shrink-0 justify-center mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                 xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>
            </svg>
            <span id="buttonText">{copyToClipboardLabel}</span>
          </button>

          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
                  onClick={playerReady}>Bereit
          </button>
        </>
      )}

      {gameState === gameStates.categorySelection && (
        <>
          <h2 className="text-2xl font-bold mb-4">Wähle eine Kategorie</h2>
          <p className="text-xl font-bold mb-2">{playerName}, wähle eine Kategorie:</p>
          <div className="flex flex-wrap justify-center">
            {categories.map((cat, index) => (
              <button key={index} className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 m-2 rounded"
                      onClick={() => selectCategory(cat)}>{cat}</button>
            ))}
          </div>
        </>
      )}

      {gameState === gameStates.categorySelectionWaiting && (
        <>
          <h2 className="text-2xl font-bold mb-4">Warte auf Kategorieauswahl</h2>
        </>
      )}

      {gameState === gameStates.selectDifficulty && (
        <>
          <h2 className="text-2xl font-bold mb-4">Wähle den Schwierigkeitsgrad</h2>
          <p className="text-xl font-bold mb-2">{playerName}, deine Auswahl:</p>
          <div className="flex flex-wrap justify-center">
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 m-2 rounded"
                    onClick={() => selectDifficulty('high')}>Schwer
            </button>
            <button className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 m-2 rounded"
                    onClick={() => selectDifficulty('low')}>Leicht
            </button>
          </div>
        </>
      )}

      {gameState === gameStates.selectDifficultyWaiting && (
        <>
          <h2 className="text-2xl font-bold mb-4">Warte auf Schwierigkeitsauswahl</h2>
        </>
      )}

      {gameState === gameStates.game && (
        <>
          <h3>{category} ({difficulty === 'low' ? 'leicht' : 'schwer'})</h3>
          <h2 className="text-2xl font-bold mb-4">
            Frage {currentQuestionIndex}/{totalQuestions}: {question}
          </h2>
          <div className="flex flex-wrap justify-center">
            {options.map((option, index) => (
              <button
                key={index}
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-2 rounded ${lastSubmittedAnswer?.toString() === index.toString() ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => submitAnswer(index)}
                disabled={lastSubmittedAnswer !== null}
              >
                {option}
              </button>
            ))}
          </div>

          {(lastSubmittedAnswer !== null && !allPlayersAnsweredQuestion) && (
            <p className="text-xl font-bold mt-4">Antwort gesendet. Warte auf andere Spieler...</p>
          )}

          {(lastSubmittedAnswer !== null && allPlayersAnsweredQuestion) && (
            <>
              {!isAnswerCorrect && (
                <div className="text-xl font-bold mb-2 bg-red-500 text-white p-4 rounded-lg">Leider war die Antwort falsch.</div>
              )}
              <div id="explanation" className="text-xl font-bold mb-2 bg-green-500 text-white p-4 rounded-lg">Korrekte
                Antwort: {explanation}</div>
            </>
          )}
          {leaderboard.length !== 0 && (
            <>
              <div className="mt-8">
                <h3 className="text-xl font-bold mb-2">Punktestand</h3>
                {leaderboard.map((player, index) => (
                  <p key={index}>{player.name}: {player.score} Punkte - letzte Antwort
                    korrekt: {player.lastQuestionCorrect ? '✅' : '❌'}</p>
                ))}
              </div>
            </>
          )}
          <button
            className={`bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded mt-4 ${!answerSubmitted ? 'opacity-50 cursor-not-allowed' : ''}\``}
            onClick={readyForNextQuestion}
            disabled={!answerSubmitted}
          >Nächste Frage
          </button>
        </>
      )}

      {gameState === gameStates.results && (
        <>
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
              <div key={index} className={`${index % 2 === 0 ? 'bg-green-100' : 'bg-red-100'} p-4 mt-2 rounded-lg`}>
                <h4 className="font-bold mb-2">{result.question}</h4>
                <p className="font-semibold">Richtige Antwort: {result.options[result.correctIndex]}</p>
                <p className="mt-2">Erklärung: {result.explanation}</p>
              </div>
            ))}
          </div>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
                  onClick={startNewGame}>Neues Spiel starten
          </button>
        </>
      )}

      {gameState === gameStates.categoryCreation && (
        <>
          <h2 className="text-2xl font-bold mb-4">Kategorie erstellen</h2>
          <input
            className="w-full p-2 mt-2 mb-2 border-2 border-pink-500 rounded"
            placeholder="Kategoriename"
            value={category}
            onChange={(e) => setCategory((e.target.value))}
          />
          <button
            className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
            onClick={createCategory}
            disabled={isLoading}
          >
            {isLoading ? 'Wird erstellt...' : 'Erstellen'}
          </button>
        </>
      )}

      {gameState === gameStates.roomJoin && (
        <>
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
        </>
      )}

      {gameState === gameStates.roomJoinByLink && (
        <>
          <h2 className="text-2xl font-bold mb-4">Raum beitreten</h2>
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
        </>
      )}

      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-pink-500"></div>
        </div>
      )}
    </>
  );
}
