'use client';

import { useParams } from 'next/navigation';
import {useEffect, useState} from "react";
import {useSocket} from "@/app/hooks/useSocket";
import ErrorModal from "@/app/components/ErrorModal";

// @TODO http://172.17.30.97:9000/quiz/geschichte-im-mittelalter/low

export default function QuizCategory() {
  const params = useParams();
  const category = params.category;
  const difficulty = params.difficulty;
  const socket = useSocket();

  const [gameState, setGameState] = useState<string>('start');
  const [playerName, setPlayerName] = useState<string>('');
  const [question, setQuestion] = useState<string>('');
  const [options, setOptions] = useState<string[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [answerSubmitted, setAnswerSubmitted] = useState<boolean>(false);
  const [explanation, setExplanation] = useState<string>('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);
  const [copyToClipboardLabel, setCopyToClipboardLabel] = useState<string>('Link kopieren');
  const [leaderboard, setLeaderboard] = useState<Array<{ name: string; score: number; lastQuestionCorrect: boolean }>>([]);
  const [singlePlayerQuizId, setSinglePlayerQuizId] = useState<string>('');
  const [lastSubmittedAnswer, setLastSubmittedAnswer] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const gameStates = {
    start: 'start',
    game: 'game',
    results: 'results',
  };

  useEffect(() => {
    if (socket) {
      socket.on('newQuestion', handleNewQuestion);
      socket.on('answerRevealed', handleAnswerRevealed);
      socket.on('gameEnded', handleGameEnded);
      socket.on('singlePlayerQuiz:started', handleStarted);
      // socket.on('gameEnded', (data) => {
      //   setLeaderboard(data.leaderboard);
      //   setResults(data.results);
      //   setGameState(gameStates.results);
      // });

      return () => {
        socket.off('newQuestion', handleNewQuestion);
        socket.off('answerRevealed', handleAnswerRevealed);
        socket.off('gameEnded', handleGameEnded);
        // socket.off('newGameStarted', handleNewGameStarted);
        socket.off('gameEnded');
      };
    }
  }, [socket, playerName]);

  const handleStarted = () => {
    setGameState(gameStates.game);
  };

  const handleNewQuestion = (data: { question: string; options: string[], totalQuestionsCount: number, difficulty: string}) => {
    setQuestion(data.question);
    setOptions(data.options);
    setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    setTotalQuestions(data.totalQuestionsCount);
    setIsAnswerCorrect(false);
  };

  const handleAnswerRevealed = (data: { options: string[], correctIndex: number, explanation: string, allPlayersAnsweredQuestion: boolean, leaderboard: Array<{ name: string; score: number; lastQuestionCorrect: boolean }> }) => {
    setExplanation(data.explanation);
    if (data.leaderboard[0].lastQuestionCorrect) {
      setIsAnswerCorrect(true);
    }
  };

  const handleGameEnded = (data: { leaderboard: Array<{ name: string; score: number; lastQuestionCorrect: boolean }>, results: Array<{ question: string, options: string[], correctIndex: number, explanation: string }> }) => {
    setLeaderboard(data.leaderboard);
    setGameState(gameStates.results);
  };

  const startGame = () => {
    if (playerName === '') {
      showError('Es muss ein Name eingegeben werden.');
      return;
    }
    if (socket) {
      socket.emit('singlePlayerQuiz:create', {category: category, playerName: playerName, difficulty: difficulty}, (singlePlayerQuiz: Array<{id: string, category: string, questions: Array<{question: string, options: Array<{string}>, correctIndex: number, explanation: string}>}>) => {
        setSinglePlayerQuizId(singlePlayerQuiz.id);
      });
    }
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setIsModalOpen(true);
  };

  const submitAnswer = (index: number) => {
    setLastSubmittedAnswer(index);
    socket?.emit('singlePlayerQuiz:submitAnswer', { roomId: roomId, answerIndex: index, currentPlayer: playerName });
    setAnswerSubmitted(true);
  };

  const readyForNextQuestion = () => {
    socket?.emit('singlePlayerQuiz:readyForNextQuestion', roomId);
    setAnswerSubmitted(false);
  };

  return (
    <div className="h-screen flex justify-center">
      <div className="flex-col w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white w-full p-6 rounded-lg shadow-lg flex-grow mx-auto mt-10">
          <ErrorModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} errorMessage={errorMessage}/>

          {gameState === gameStates.start && (
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
                onClick={startGame}
              >
                Party beitreten
              </button>
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

              {(lastSubmittedAnswer !== null && !answerSubmitted) && (
                <p className="text-xl font-bold mt-4">Antwort gesendet. Warte auf andere Spieler...</p>
              )}

              {(lastSubmittedAnswer !== null && answerSubmitted) && (
                <>
                  {!isAnswerCorrect && (
                    <div className="text-xl font-bold mb-2 bg-red-500 text-white p-4 rounded-lg">Leider war die Antwort
                      falsch.</div>
                  )}
                  <div id="explanation"
                       className="text-xl font-bold mb-2 bg-green-500 text-white p-4 rounded-lg">Korrekte
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
        </div>
      </div>
    </div>
      );
    }
