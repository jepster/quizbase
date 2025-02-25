import React, {useState, useEffect, useCallback, useMemo} from 'react';
import { Socket } from 'socket.io-client';
import ErrorModal from "@/app/components/modal/ErrorModal";
import SuccessModal from "@/app/components/modal/SuccessModal";
import { useRouter } from 'next/navigation';
import DifficultySelector from "@/app/components/DifficultySelector";
import Modal from 'react-modal';
import HackerMode from "@/app/components/HackerMode";
import { useHackerMode } from "@/app/components/HackerMode";
import DeleteButton from "@/app/components/DeleteButton";
import type Category from "@/app/types/Category";

interface GameInterfaceProps {
  socket: Socket | null;
  gameState: string;
  roomId: string;
  setGameState: React.Dispatch<React.SetStateAction<string>>;
  setRoomId: React.Dispatch<React.SetStateAction<string>>;
  resetGame: () => void;
}

export default function DevGameInterface({ socket, gameState, setGameState, setRoomId, roomId }: GameInterfaceProps) {
  const [playerName, setPlayerName] = useState<string>('');
  const [players, setPlayers] = useState<Array<{ name: string; ready: boolean }>>([]);
  const [question, setQuestion] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [topic, setTopic] = useState<Category | null>(null);
  const [difficulty, setDifficulty] = useState<string>('');
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState<number | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
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
  const [categories, setCategories] = useState<Category[]>([]);
  const router = useRouter();
  const isHackerMode = useHackerMode();

  const [filterTopic, setFilterTopic] = useState<string>('');
  const [topicOptions, setTopicOptions] = useState<string[]>([]);
  useEffect(() => {
    // Extract unique topicHumanReadable values from categories
    if (categories) {
      const uniqueTopics = [...new Set(categories.map(cat => cat.topicHumanReadable).filter(topic => topic))];
      setTopicOptions(uniqueTopics);
    }
  }, [categories]);

  const filteredCategories = useMemo(() => {
    if (!filterTopic) {
      return categories;
    }
    return categories.filter(category => category.topicHumanReadable === filterTopic);
  }, [categories, filterTopic]);

  const gameStates = useMemo(() => ({
    start: 'start',
    roomCreation: 'room-creation',
    waitingRoom: 'waiting-room',
    categorySelection: 'category-selection',
    categorySelectionWaiting: 'category-selection-waiting',
    selectDifficultySynchronous: 'select-difficulty-synchronous',
    selectDifficultyAsynchronous: 'select-difficulty-asynchronous',
    selectDifficultyWaiting: 'select-difficulty-waiting',
    game: 'game',
    results: 'results',
    categoryCreation: 'category-creation',
    roomJoin: 'room-join',
    roomJoinByLink: 'room-join-by-link',
  }), []);

  const handleCategoryDeleted = useCallback((data: { message: string, categories: Category[] }) => {
    setSuccessMessage(data.message);
    setIsSuccessModalOpen(true);
    setCategories(data.categories);
  }, []);

  const handlePlayerJoined = useCallback((data: { player: string, players: Array<{ name: string; ready: boolean }> }) => {
    if (playerName !== data.player) {
      showNotification('Benachrichtigung', `${data.player} ist dem Raum beigetreten.`);
    }
    setPlayers(data.players);
    setGameState(gameStates.waitingRoom);
  }, [playerName, gameStates, setGameState]);

  const handlePlayerReady = useCallback((data: { players: Array<{ name: string; ready: boolean }> }) => {
    setPlayers(data.players);
    const allPlayersReady = data.players.every(player => player.ready);
    if (allPlayersReady) {
      setGameState(gameStates.categorySelection);
    }
  }, [gameStates, setGameState]);

  const handleSelectCategory = useCallback((data: { playerName: string, categories: Category[] }) => {
    if (data.playerName === playerName) {
      setGameState(gameStates.categorySelection);
    } else {
      setGameState(gameStates.categorySelectionWaiting);
    }
  }, [playerName, gameStates, setGameState]);

  const handleSelectDifficultySynchronous = useCallback((data: { playerName: string, category: Category, difficulty: string }) => {
    setCategory(data.category);
    if (data.playerName === playerName) {
      setGameState(gameStates.selectDifficultySynchronous);
    } else {
      setGameState(gameStates.selectDifficultyWaiting);
    }
  }, [playerName, gameStates, setGameState]);

  const handleCategoryCreated = useCallback((data: {category: Category}) => {
    setIsLoading(false);
    setGameState(gameStates.start);
    if (socket) {
      socket.emit('getCategories', (categories: Category[]) => {
        setCategories(categories);
      });
    }
    setSuccessMessage(`Kategorie "${data.category.humanReadableName}" erfolgreich erstellt.`);
    setIsSuccessModalOpen(true);
    setCategory(null);
  }, [socket, gameStates, setGameState]);

  const handleNewQuestion = useCallback((data: {
    question: string;
    options: string[];
    totalQuestionsCount: number;
    currentQuestionIndex: number;
    difficulty: string;
  }) => {
    setQuestion(data.question);
    setOptions(data.options);
    setCurrentQuestionIndex(data.currentQuestionIndex);
    setTotalQuestions(data.totalQuestionsCount);
    setIsAnswerCorrect(false);
    setAnswerSubmitted(false);
    setLastSubmittedAnswer(null);
    setGameState(gameStates.game);
  }, [gameStates, setGameState]);

  const handleGameEnded = useCallback((data: {
    leaderboard: Array<{ name: string; score: number; lastQuestionCorrect: boolean }>,
    results: Array<{ question: string, options: string[], correctIndex: number, explanation: string }>
  }) => {
    setLeaderboard(data.leaderboard);
    setResults(data.results);
    setGameState(gameStates.results);
    setCurrentQuestionIndex(0);
  }, [gameStates, setGameState]);

  const handleNewGameStarted = useCallback((players: Array<{ name: string; ready: boolean }>) => {
    setPlayers(players);
    setGameState(gameStates.waitingRoom);
  }, [gameStates, setGameState]);

  const handleAnswerRevealed = useCallback((data: { options: string[], correctIndex: number, explanation: string, allPlayersAnsweredQuestion: boolean, leaderboard: Array<{ name: string; score: number; lastQuestionCorrect: boolean }> }) => {
    setExplanation(data.explanation);
    if (data.leaderboard[0].lastQuestionCorrect) {
      setIsAnswerCorrect(true);
    }
    setLeaderboard(data.leaderboard);
    setAllPlayersAnsweredQuestion(data.allPlayersAnsweredQuestion);
  }, []);

  useEffect(() => {
    Modal.setAppElement('body');
    if (socket) {
      socket.on('playerJoined', handlePlayerJoined);
      socket.on('playerReady', handlePlayerReady);
      socket.on('selectCategory', handleSelectCategory);
      socket.on('selectDifficultySynchronous', handleSelectDifficultySynchronous);
      socket.on('newQuestion', handleNewQuestion);
      socket.on('answerRevealed', handleAnswerRevealed);
      socket.on('gameEnded', handleGameEnded);
      socket.on('newGameStarted', handleNewGameStarted);
      socket.on('categoryCreated', handleCategoryCreated);
      socket.on('categoryDeleted', handleCategoryDeleted);

      socket.emit('getCategories', (categories: Category[]) => {
        setCategories(categories);
      });

      return () => {
        socket.off('playerJoined', handlePlayerJoined);
        socket.off('playerReady', handlePlayerReady);
        socket.off('selectCategory', handleSelectCategory);
        socket.off('selectDifficultySynchronous', handleSelectDifficultySynchronous);
        socket.off('newQuestion', handleNewQuestion);
        socket.off('answerRevealed', handleAnswerRevealed);
        socket.off('gameEnded', handleGameEnded);
        socket.off('newGameStarted', handleNewGameStarted);
        socket.off('categoryCreated', handleCategoryCreated);
        socket.off('categoryDeleted', handleCategoryDeleted);
      };
    }
  }, [socket, playerName, handleCategoryCreated, handleGameEnded, handleNewGameStarted, handleNewQuestion, handlePlayerJoined, handlePlayerReady, handleSelectCategory, handleSelectDifficultySynchronous, handleAnswerRevealed, handleCategoryDeleted]);

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

  const selectCategory = (category: Category) => {
    socket?.emit('categorySelected', { roomId: roomId, category: category });
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
    setIsErrorModalOpen(true);
  };

  const createCategory = () => {
    if (category === null) {
      showError('Bitte gib einen Kategorienamen ein.');
      return;
    }
    if (topic === null) {
      showError('Bitte gib ein Themengebiet ein.');
      return;
    }
    setIsLoading(true);
    socket?.emit('createCustomCategory', { category: category, topic: topic });
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

  const handleAsyncCategorySelect = (category: Category) => {
    setCategory(category);
    setGameState(gameStates.selectDifficultyAsynchronous);
  };

  const handleDifficultySelectAsynchronous = (difficulty: string) => {
    if (category === null) {
      throw new Error('Category must be set to handle difficulty.');
    }
    router.push(`/quiz/${encodeURIComponent(category.machineName)}/${difficulty}`);
  };

  const handleDifficultySelectSynchronous = (difficulty: string) => {
    setDifficulty(difficulty);
    socket?.emit('difficultySelected', { roomId: roomId, difficulty });
  };

  const handleDelete = (category: Category) => {
    socket?.emit('deleteCategory', category);
  };

  function createMachineName(humanReadableName: string) {
    const machineName = humanReadableName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .replace(/-+/g, '-');

    return {humanReadableName, machineName};
  }

  const processCategoryName = (humanReadableName: string): Category => {
    return createMachineName(humanReadableName);
  };

  const processTopicName = (humanReadableName: string): Category => {
    return createMachineName(humanReadableName);
  };

  return (
    <>
      <ErrorModal isOpen={isErrorModalOpen} closeModal={() => setIsErrorModalOpen(false)} errorMessage={errorMessage} />
      <SuccessModal isOpen={isSuccessModalOpen} closeModal={() => setIsSuccessModalOpen(false)} successMessage={successMessage} />
      <HackerMode />

      {gameState === gameStates.start && (
        <>
          <h1 className="text-3xl font-bold text-gray-800 mb-4">Quizmaster</h1>
          <h2 className="text-2xl font-bold text-gray-800">Synchrone Spiele</h2>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded m-2"
                  onClick={() => setGameState(gameStates.roomCreation)}>Quiz erstellen
          </button>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold my-5 py-2 px-4 rounded m-2"
                  onClick={() => setGameState(gameStates.roomJoin)}>Quiz beitreten
          </button>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold my-5 py-2 px-4 rounded m-2"
                  onClick={() => setGameState(gameStates.categoryCreation)}>Kategorie erstellen
          </button>
          <div>
            <label htmlFor="topicFilter" className="mr-2">Themengebiet Filter:</label>
            <select
              id="topicFilter"
              className="p-2 border-2 border-gray-300 rounded"
              value={filterTopic}
              onChange={(e) => setFilterTopic(e.target.value)}
            >
              <option value="">Alle Themen</option>
              {topicOptions.map((topic, index) => (
                <option key={index} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          {filteredCategories.map((category, index) => (
            <React.Fragment key={index}>
              {!isHackerMode ? (
                <div className="relative">
                  <button
                    onClick={() => handleAsyncCategorySelect(category)}
                    className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded m-2"
                  >
                    {category.humanReadableName}
                  </button>
                  {category.topicHumanReadable && (
                    <span className="absolute top-0 right-0 bg-gray-300 text-gray-700 rounded-full px-2 py-1 text-xs">
                            {category.topicHumanReadable}
                          </span>
                  )}
                </div>
              ) : (
                <DeleteButton onDelete={() => handleDelete(category)} category={category} />
              )}
            </React.Fragment>
          ))}
        </>
      )}

      {gameState === gameStates.roomCreation && (
        <form onSubmit={(e) => {
          e.preventDefault();
          createRoom();
        }}>
          <h2 className="text-2xl font-bold mb-4">Quiz erstellen</h2>
          <input
            className="w-full p-2 mt-2 mb-2 border-2 border-pink-500 rounded"
            placeholder="Dein Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded">Raum erstellen</button>
        </form>
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
          <div className="flex flex-wrap justify-center">
            {categories.map((category, index) => {
              return (
                <button
                  key={index}
                  onClick={() => selectCategory(category)}
                  className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 m-2 rounded"
                >
                  {category.humanReadableName}
                </button>
              );
            })}
          </div>
        </>
      )}

      {gameState === gameStates.categorySelectionWaiting && (
        <>
          <h2 className="text-2xl font-bold mb-4">Warte auf Kategorieauswahl</h2>
        </>
      )}

      {gameState === gameStates.selectDifficultySynchronous && (
        <DifficultySelector onSelect={handleDifficultySelectSynchronous} />
      )}

      {gameState === gameStates.selectDifficultyAsynchronous && (
        <DifficultySelector onSelect={handleDifficultySelectAsynchronous} />
      )}

      {gameState === gameStates.selectDifficultyWaiting && (
        <>
          <h2 className="text-2xl font-bold mb-4">Warte auf Schwierigkeitsauswahl</h2>
        </>
      )}

      {gameState === gameStates.game && (
        <>
          <h3>{category?.humanReadableName} ({difficulty === 'low' ? 'leicht' : 'schwer'})</h3>
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
                <div className="text-xl font-bold mb-2 bg-red-500 text-white p-4 rounded-lg">Leider war die Antwort
                  falsch.</div>
              )}
              <div id="explanation" className="text-xl font-bold mb-2 bg-green-500 text-white p-4 rounded-lg">Korrekte
                Antwort: {explanation}</div>
            </>
          )}
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded-r mt-5">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                   xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p>
                <strong>Hinweis:</strong> Die Quizfrage wurde mit KI erzeugt. Die Korrektheit kann daher nicht
                garantiert werden.
              </p>
            </div>
          </div>
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
        <form onSubmit={(e) => {
          e.preventDefault();
          createCategory();
        }}>
          <h2 className="text-2xl font-bold mb-4">Kategorie erstellen</h2>
          <input
            className="w-full p-2 mt-2 mb-2 border-2 border-pink-500 rounded"
            placeholder="Kategoriename"
            value={category?.humanReadableName || ''}
            onChange={(e) => {
              const processedCategory = processCategoryName(e.target.value);
              setCategory(processedCategory);
            }}
          />
          <input
            className="w-full p-2 mt-2 mb-2 border-2 border-pink-500 rounded"
            placeholder="Themengebiet"
            value={topic?.humanReadableName || ''}
            onChange={(e) => {
              const processedTopic = processTopicName(e.target.value);
              setTopic(processedTopic);
            }}
          />
          <button
            className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? 'Wird erstellt...' : 'Erstellen'}
          </button>
        </form>
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
