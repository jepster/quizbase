import { useState, useEffect } from 'react';
import { Socket } from 'socket.io-client';

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
  const [category, setCategory] = useState<string>('start');

  const gameStates = {
    start: 'start',
    categorySelection: 'category-selection',
    categorySelectionWaiting: 'category-selection-waiting',
    waitingRoom: 'waiting-room',
    game: 'game',
    roomCreation: 'room-creation',
  }

  useEffect(() => {
    if (socket) {
      socket.on('playerJoined', handlePlayerJoined);
      socket.on('newQuestion', handleNewQuestion);
      socket.on('newGameStarted', handleNewGameStarted);
      socket.on('playerReady', (data) => {
        setPlayers(data.players);
        socket.emit('playerReady', {room, playerName});
      });
      socket.on('selectCategory', (data) => {
        if (data.playerName === playerName) {
          setGameState(gameStates.categorySelection);
          setCategories(data.categories);
        } else {
          setGameState(gameStates.categorySelectionWaiting);}
      });

      return () => {
        socket.off('playerJoined', handlePlayerJoined);
        socket.off('newQuestion', handleNewQuestion);
        // Remove other event listeners
      };
    }
  }, [socket, playerName]);

  const showNotification = ((title: string, body: string) => {
    if (Notification.permission !== "granted") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, {
            body: body,
            icon: "bell_icon.png"
          });
        }
      });
    } else {
      new Notification(title, {
        body: body,
        icon: "bell_icon.png"
      });
    }
  });

  const handleNewGameStarted = ((players) => {
    setGameState(gameStates.waitingRoom);
  });

  const handlePlayerJoined = (data: { player: string, players: Array<{ name: string; ready: boolean }> }) => {
    if (playerName !== data.player) {
      showNotification('Benachrichtigung', `${data.player} ist dem Raum beigetreten.`);
    }
    setPlayers(data.players);
    setGameState(gameStates.waitingRoom);
  };

  const handleNewQuestion = (data: { question: string; options: string[] }) => {
    setQuestion(data.question);
    setOptions(data.options);
    setGameState(gameStates.game);
  };

  const selectCategory = ((category: string) => {
    setCategory(category);
    if (socket) {
      socket.emit('categorySelected', { room, category });
    }
  });

  // Implement other game logic functions here

  return (
    <div>
      {gameState === gameStates.start && (
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
      {gameState === gameStates.roomCreation && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Quiz erstellen</h2>
          <input
            id="player-name-create"
            className="w-full p-2 mt-2 mb-2 border-2 border-pink-500 rounded"
            placeholder="Dein Name"
            onChange={(e) => {
              if (e.target.value.length > 0) {
                console.log('player name: ' + e.target.value);
                setPlayerName(e.target.value)}
              }
            }
          />
          <button className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
                  onClick={() => {
                    if (socket) {
                      socket.emit('createRoom', (roomId) => {
                        setRoom(roomId);
                        socket.emit('joinRoom', {roomId, playerName});
                      });
                    }
                  }}>Raum erstellen
          </button>
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
          <button
            className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 rounded"
            onClick={() => {
              socket?.emit('playerReady', { currentRoom: room, currentPlayer: playerName })
            }
          }
          >
            Bereit
          </button>
        </div>
      )}
      {gameState === gameStates.categorySelection && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Wähle eine Kategorie</h2>
          <p id="category-selector" className="text-xl font-bold mb-2">
            {playerName}, wähle eine Kategorie:
          </p>
          <div id="category-buttons" className="flex flex-wrap justify-center"></div>
          {categories.map((category, index) =>
            <button key={index} className="bg-pink-500 hover:bg-pink-700 text-white font-bold py-2 px-4 m-2 rounded" onClick={() => {selectCategory(category)}}>{category}</button>
          )}
        </div>
      )}
      {gameState === gameStates.categorySelectionWaiting && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Wähle eine Kategorie</h2>
          <p id="category-selector" className="text-xl font-bold mb-2">
            {playerName} wählt eine Kategorie
          </p>
        </div>
      )}
    </div>
  );
}
