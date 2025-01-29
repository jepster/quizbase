import React, {useState, useEffect, useCallback, useMemo} from 'react';
import { Socket } from 'socket.io-client';
import ErrorModal from "@/app/components/modal/ErrorModal";
import SuccessModal from "@/app/components/modal/SuccessModal";
import { useRouter } from 'next/navigation';
import DifficultySelector from "@/app/components/DifficultySelector";
import Modal from 'react-modal';
import HackerMode from "@/app/components/HackerMode";
import { useHackerMode } from "@/app/components/HackerMode";
import type Category from "@/app/types/Category";
import { setPlayerName } from "@/app/store/slices/userSlice";
import {Provider, useDispatch, useSelector} from 'react-redux';
import {RootState} from "@/app/store";
import {useSocket} from "@/app/hooks/useSocket";

interface GameInterfaceProps {
  socket: Socket | null;
  gameState: string;
  roomId: string;
  setGameState: React.Dispatch<React.SetStateAction<string>>;
  setRoomId: React.Dispatch<React.SetStateAction<string>>;
  resetGame: () => void;
}

export default function GameInterface({ socket, gameState, setGameState }: GameInterfaceProps) {
  const [question, setQuestion] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [difficulty, setDifficulty] = useState<string>('');
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState<number | null>(null);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [results, setResults] = useState<Array<{ question: string, options: string[], correctIndex: number, explanation: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<string>('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [singlePlayerQuizId, setSinglePlayerQuizId] = useState<string>('');
  const [toplist, setToplist] = useState<Array<{
    playerName: string,
    score: number,
    category: Category,
    difficulty: string,
    playDate: Date
  }>>([]);
  const [score, setScore] = useState<number>(0);

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
    playerNameInput: 'player-name-input',
  }), []);

  const handleCategoryDeleted = useCallback((data: { message: string, categories: Category[] }) => {
    setSuccessMessage(data.message);
    setIsSuccessModalOpen(true);
    setCategories(data.categories);
  }, []);

  const dispatch = useDispatch();
  const playerName = useSelector((state: RootState) => state.user.playerName);
  const [inputName, setInputName] = useState<string>(playerName);

  const handleSelectCategory = useCallback((data: { playerName: string, categories: Category[] }) => {
    if (data.playerName === playerName) {
      setGameState(gameStates.categorySelection);
    } else {
      setGameState(gameStates.categorySelectionWaiting);
    }
  }, [playerName, gameStates, setGameState]);

  const handleSelectDifficultySynchronous = useCallback((data: { playerName: string, category: Category, difficulty: string }) => {
    setCategory(data.category);
  }, [playerName, gameStates, setGameState]);

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
    results: Array<{ question: string, options: string[], correctIndex: number, explanation: string }>,
    score: number,
    totalQuestions: number,
    toplist: Array<{
      playerName: string,
      score: number,
      category: Category,
      difficulty: string,
      playDate: Date
    }>
  }) => {
    setGameState(gameStates.results);
    setScore(data.score);
    setToplist(data.toplist);
    setResults(data.results);
  }, [gameStates]);

  const handleAnswerResult = useCallback((data: {
    correctIndex: number,
    explanation: string,
    isCorrect: boolean,
    score: number
  }) => {
    setExplanation(data.explanation);
    setIsAnswerCorrect(data.isCorrect);
    setAnswerSubmitted(true);
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('singlePlayerQuiz:question', handleNewQuestion);
      socket.on('singlePlayerQuiz:answerResult', handleAnswerResult);
      socket.on('singlePlayerQuiz:gameEnded', handleGameEnded);
      socket.emit('getCategories', (categories: Category[]) => {
        setCategories(categories);
      });

      return () => {
        socket.off('singlePlayerQuiz:question', handleNewQuestion);
        socket.off('getCategories', handleNewQuestion);
        socket.off('singlePlayerQuiz:answerResult', handleAnswerResult);
        socket.off('singlePlayerQuiz:gameEnded', handleGameEnded);
      };
    }
  }, [socket, playerName, handleNewQuestion, handleAnswerResult, handleGameEnded, category]);

  const selectCategory = (category: Category) => {
    setCategory(category);
  };

  const submitAnswer = (index: number) => {
    setLastSubmittedAnswer(index);
    socket?.emit('singlePlayerQuiz:submitAnswer', {quizId: singlePlayerQuizId, answerIndex: index});
  };

  const readyForNextQuestion = () => {
    socket?.emit('singlePlayerQuiz:nextQuestion', singlePlayerQuizId);
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setIsErrorModalOpen(true);
  };

  const updatePlayerName = (name: string) => {
    dispatch(setPlayerName(name));
  };

  const handleAsyncCategorySelect = (category: Category) => {
    setCategory(category);
    setGameState(gameStates.selectDifficultyAsynchronous);
  };

  const handleDifficultySelectAsynchronous = async (selectedDifficulty: string) => {
    setDifficulty(selectedDifficulty);
    setGameState(gameStates.playerNameInput);
  };

  const startGame = () => {
    if (playerName === '' && inputName === '') {
      showError('Es muss ein Name eingegeben werden.');
      return;
    }
    if (socket) {
      const name = playerName || inputName;
      updatePlayerName(name);
      socket.emit('singlePlayerQuiz:create', {category, playerName: name, difficulty}, (singlePlayerQuiz: { id: string }) => {
        setSinglePlayerQuizId(singlePlayerQuiz.id);
      });
    }
  };

  const formatDate = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${day}.${month}.${year} - ${hours}:${minutes} Uhr`;
  }

  const resetGame = () => {
    setGameState(gameStates.start);
  };

  return (
    <>
      <ErrorModal isOpen={isErrorModalOpen} closeModal={() => setIsErrorModalOpen(false)} errorMessage={errorMessage} />
      <SuccessModal isOpen={isSuccessModalOpen} closeModal={() => setIsSuccessModalOpen(false)} successMessage={successMessage} />
      <HackerMode />

      {gameState === gameStates.start && (
        <>
          {
            categories.length > 0 && (
              <>
                {categories.map((category, index) => (
                  <React.Fragment key={index}>
                    <button
                      onClick={() => handleAsyncCategorySelect(category)}
                      className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-2 px-4 rounded m-2"
                    >
                      {category.humanReadableName}
                    </button>
                  </React.Fragment>
                ))}
              </>
            )
          }
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

      {gameState === gameStates.selectDifficultyAsynchronous && (
        <DifficultySelector onSelect={handleDifficultySelectAsynchronous} />
      )}

      {gameState === gameStates.playerNameInput && (
        <form onSubmit={(e) => {
          e.preventDefault();
          updatePlayerName(inputName);
          startGame();
        }}>
          <h2 className="text-2xl font-bold mb-4">Spiel starten</h2>
          <input
            className="w-full p-2 mt-2 mb-2 border-2 border-pink-500 rounded"
            placeholder="Dein Name"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
          />
          <button
            className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
            type="submit"
          >
            Spiel starten
          </button>
        </form>
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
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-2 rounded ${lastSubmittedAnswer === index ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => submitAnswer(index)}
                disabled={answerSubmitted}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-700 p-4 mb-4 rounded-r mt-5">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                   xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p>
                <strong>Hinweis:</strong> Die Quizfrage wurde mit KI erzeugt. Die Korrektheit kann daher nicht garantiert werden.
              </p>
            </div>
          </div>

          {answerSubmitted && (
            <>
              <div
                className={`text-xl font-bold mb-2 ${isAnswerCorrect ? 'bg-green-500' : 'bg-red-500'} text-white p-4 rounded-lg`}>
                {isAnswerCorrect ? 'Richtig!' : 'Falsch!'} {explanation}
              </div>
              <button
                className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={readyForNextQuestion}
              >
                Nächste Frage
              </button>
            </>
          )}
        </>
      )}

      {gameState === gameStates.results && (
        <>
          <h2 className="text-2xl font-bold mb-4">Spielergebnis</h2>
          <p>Dein Endergebnis: {score} von {totalQuestions} Punkten</p>
          <h3 className="text-xl font-bold mt-6 mb-2">Bestenliste</h3>
          <ul>
            {toplist.map((entry, index) => (
              <li key={index} className="mb-2">
                {entry.playerName}: {entry.score} Punkte
                ({formatDate(new Date(entry.playDate))})
              </li>
            ))}
          </ul>
          <button
            className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded mt-4 mb-5"
            onClick={() => resetGame()}
          >
            Neues Spiel starten
          </button>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">Fragen und Antworten</h3>
            {results.map((result, index) => (
              <div key={index}
                   className={`${index % 2 === 0 ? 'bg-green-100' : 'bg-red-100'} p-4 mt-2 rounded-lg`}>
                <h4 className="font-bold mb-2">{result.question}</h4>
                <p className="font-semibold">Richtige Antwort: {result.options[result.correctIndex]}</p>
                <p className="mt-2">Erklärung: {result.explanation}</p>
              </div>
            ))}
          </div>
          <button
            className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => resetGame()}
          >
            Neues Spiel starten
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
