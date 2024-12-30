import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';
import LoginForm from "@/app/components/LoginForm";

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

  useEffect(() => {
    if (socket) {
      socket.on('playerJoined', handlePlayerJoined);
      socket.on('newQuestion', handleNewQuestion);
      socket.on('newGameStarted', handleNewGameStarted);
      // Add other event listeners here

      return () => {
        socket.off('playerJoined', handlePlayerJoined);
        socket.off('newQuestion', handleNewQuestion);
        // Remove other event listeners
      };
    }
  }, [socket]);

  const handleNewGameStarted = ((players) => {
    setGameState('waiting-room');
  });

  const handlePlayerJoined = (data: { players: Array<{ name: string; ready: boolean }> }) => {
    setPlayers(data.players);
    setGameState('waiting-room');
  };

  const handleNewQuestion = (data: { question: string; options: string[] }) => {
    setQuestion(data.question);
    setOptions(data.options);
    setGameState('game');
  };

  // Implement other game logic functions here

  return (
    <div>
      {gameState === 'start' && (
        <div>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => setGameState('room-creation')}>Quiz erstellen
          </button>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold my-5 py-2 px-4 rounded"
                  onClick={() => setGameState('room-join')}>Quiz beitreten
          </button>
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => setGameState('create-category')}>Kategorie erstellen
          </button>
        </div>
      )}
      {gameState === 'room-creation' && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Quiz erstellen</h2>
          <input
            id="player-name-create"
            className="w-full p-2 mt-2 mb-2 border-2 border-pink-500 rounded"
            placeholder="Dein Name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    if (socket) {
                      socket.emit('createRoom', (roomId) => {
                        socket.emit('joinRoom', {roomId, playerName});
                      });
                    }
                  }}>Raum erstellen
          </button>
        </div>
      )}
      {gameState === 'waiting-room' && (
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
          <button
            className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => socket?.emit('playerReady', { roomId: room, playerName })}
          >
            Bereit
          </button>
        </div>
      )}
    </div>
  );
}
