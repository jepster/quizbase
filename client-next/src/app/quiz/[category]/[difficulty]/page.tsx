'use client';

import { useParams } from 'next/navigation';
import {useEffect, useState} from "react";
import {useSocket} from "@/app/hooks/useSocket";
import ErrorModal from "@/app/components/ErrorModal";

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
      socket.on('newGameStarted', handleNewGameStarted);
      socket.on('gameEnded', (data) => {
        setLeaderboard(data.leaderboard);
        setResults(data.results);
        setGameState(gameStates.results);
      });

      return () => {
        socket.off('newQuestion', handleNewQuestion);
        socket.off('answerRevealed', handleAnswerRevealed);
        socket.off('gameEnded', handleGameEnded);
        socket.off('newGameStarted', handleNewGameStarted);
        socket.off('gameEnded');
      };
    }
  }, [socket, playerName]);

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
      socket.emit('createSinglePlayerQuiz', (singlePlayerQuizId: string) => {
        setSinglePlayerQuizId(singlePlayerQuizId);
        socket.emit('startSinglePlayerQuiz', { singlePlayerQuizId, playerName });
      });
    }
  };

  const showError = (message: string) => {
    setErrorMessage(message);
    setIsModalOpen(true);
  };

  return (
    <>
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
    </>
  );
}
