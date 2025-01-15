'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from "react";
import { useSocket } from "@/app/hooks/useSocket";
import ErrorModal from "@/app/components/ErrorModal";

// @TODO http://172.17.30.97:9000/quiz/geschichte-im-mittelalter/low


export default function AnsynchronousQuiz() {
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
      socket.on('singlePlayerQuiz:question', handleNewQuestion);
      socket.on('singlePlayerQuiz:answerResult', handleAnswerResult);
      socket.on('singlePlayerQuiz:gameEnded', handleGameEnded);

      return () => {
        socket.off('singlePlayerQuiz:question', handleNewQuestion);
        socket.off('singlePlayerQuiz:answerResult', handleAnswerResult);
        socket.off('singlePlayerQuiz:gameEnded', handleGameEnded);
      };
    }
  }, [socket, playerName]);

  const handleNewQuestion = (data: { question: string; options: string[], totalQuestionsCount: number, currentQuestionIndex: number, difficulty: string }) => {
    setQuestion(data.question);
    setOptions(data.options);
    setCurrentQuestionIndex(data.currentQuestionIndex);
    setTotalQuestions(data.totalQuestionsCount);
    setIsAnswerCorrect(false);
    setAnswerSubmitted(false);
    setLastSubmittedAnswer(null);
    setGameState(gameStates.game);
  };

  const handleAnswerResult = (data: { correctIndex: number, explanation: string, isCorrect: boolean, score: number }) => {
    setExplanation(data.explanation);
    setIsAnswerCorrect(data.isCorrect);
    setAnswerSubmitted(true);
  };

  const handleGameEnded = (data: { score: number, totalQuestions: number }) => {
    setGameState(gameStates.results);
  };

  const startGame = () => {
    if (playerName === '') {
      showError('Es muss ein Name eingegeben werden.');
      return;
    }
    if (socket) {
      socket.emit('singlePlayerQuiz:create', { category, playerName, difficulty }, (singlePlayerQuiz: { id: string }) => {
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
    socket?.emit('singlePlayerQuiz:submitAnswer', { quizId: singlePlayerQuizId, answerIndex: index });
  };

  const readyForNextQuestion = () => {
    socket?.emit('singlePlayerQuiz:nextQuestion', singlePlayerQuizId);
  };

  return (
    <div className="h-screen flex justify-center">
      <div className="flex-col w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white w-full p-6 rounded-lg shadow-lg flex-grow mx-auto mt-10">
          <ErrorModal isOpen={isModalOpen} closeModal={() => setIsModalOpen(false)} errorMessage={errorMessage}/>

          {gameState === gameStates.start && (
            <>
              <h2 className="text-2xl font-bold mb-4">Spiel starten</h2>
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
                Spiel starten
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
                    className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 m-2 rounded ${lastSubmittedAnswer === index ? 'opacity-50 cursor-not-allowed' : ''}`}
                    onClick={() => submitAnswer(index)}
                    disabled={answerSubmitted}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {answerSubmitted && (
                <>
                  <div className={`text-xl font-bold mb-2 ${isAnswerCorrect ? 'bg-green-500' : 'bg-red-500'} text-white p-4 rounded-lg`}>
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
              <p>Dein Endergebnis: {leaderboard[0]?.score} von {totalQuestions} Punkten</p>
              <button
                className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded mt-4"
                onClick={() => setGameState(gameStates.start)}
              >
                Neues Spiel starten
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
