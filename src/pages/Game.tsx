import { useSocket } from '../context/SocketContext';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import { useEffect, useState, useRef } from "react";
import { updatePlayerIsReady, updatePlayerProgress } from "../redux/playerDataSlice.ts";
import { useNavigate } from "react-router-dom";
import { GameState } from "../interfaces/GameStatus.ts";

export function Game() {
  const navigate = useNavigate();
  const socket = useSocket();
  const dispatch = useDispatch();

  // Selectores de Redux
  const players = useSelector((state: RootState) => state.players.players);
  const partieState = useSelector((state: RootState) => state.partieState);
  const player = useSelector((state: RootState) => state.playerData.player);

  // Estados locales
  const [userInput, setUserInput] = useState('');
  const inputRef = useRef<HTMLInputElement>(null); // Referencia para mantener el foco en móviles
  const targetText = partieState.text || '';

  // Efecto 1: Forzar el foco cuando el juego empieza o cambia de estado
  useEffect(() => {
    if (partieState.state === GameState.Running) {
      inputRef.current?.focus();
    }
  }, [partieState.state]);

  // Efecto 2: Manejar el fin del juego
  useEffect(() => {
    if ((partieState.state as string) === 'finished') {
      dispatch(updatePlayerIsReady({ value: false }));

      if (socket) {
        socket.emit('message', JSON.stringify({
          event: 'update_user_state',
          message: {
            room: player?.room || "",
            conn_id: player?.conn_id || "",
            is_ready: false
          }
        }));
      }
    }
  }, [partieState.state, dispatch, player?.conn_id, player?.room, socket]);

  // Lógica de cálculo de precisión
  const calculateCorrectChars = (input: string, originalText: string): number => {
    let correctCount = 0;
    for (let i = 0; i < input.length; i++) {
      if (input[i] === originalText[i]) {
        correctCount++;
      }
    }
    return correctCount;
  };

  // Manejador del input (Optimizado para móviles)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUserInput(value);

    const hits = calculateCorrectChars(value, targetText);
    const progress = Math.round((hits / (targetText.length || 1)) * 100);

    // Emitir progreso al servidor
    if (socket) {
      socket.emit('message', JSON.stringify({
        event: 'update_user_progress',
        message: {
          room: player?.room || '',
          conn_id: player?.conn_id || '',
          progress: progress
        }
      }));
    }

    // Actualizar Redux local (Solo progreso para evitar re-renders masivos)
    dispatch(updatePlayerProgress({ value: progress }));
  };

  const goBackToLoby = () => {
    navigate('/loby');
  };

  return (
      <div className="min-h-screen  w-full  text-white m-0 p-4">
        <h1 className='lg:text-5xl text-2xl text-center mb-4'>🗡️ Game: {player?.room} 🗡️</h1>
        <h3 className='py-5 text-2xl text-center text-blue-400'>{player?.name}, type as fast as you can!</h3>

        <div className='flex flex-col lg:flex-row justify-between mt-10 px-4 gap-8'>
          {/* Tabla de Jugadores */}
          <div className="overflow-x-auto w-full lg:w-2/3">
            <table className='w-full table-fixed bg-cyan-100/10 rounded-lg'>
              <thead className='text-2xl text-green-500'>
              <tr className='bg-green-500/20 text-white'>
                <td className='p-2 text-center'>Player</td>
                <td className='p-2 text-center'>Progress</td>
                <td className='p-2 text-center'>Place</td>
              </tr>
              </thead>
              <tbody>
              {players.map((gamePlayer) => (
                  <tr className='text-2xl border-b border-white/5' key={gamePlayer.conn_id}>
                    <td className='p-2 text-center'>{gamePlayer.name}</td>
                    <td className='p-2 text-center'>{gamePlayer.progress}%</td>
                    <td className='p-2 text-center text-yellow-400 font-bold'>
                      {gamePlayer?.place || ''}
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>

          <div className="text-3xl font-bold text-center flex items-center justify-center bg-slate-900 p-6 rounded-xl border border-white/10">
            Timer
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-4 mt-10">
          {/* Texto de referencia con resaltado de errores */}
          <div className='px-6 py-8 border rounded-xl border-green-500/50 bg-slate-900 shadow-lg'>
            <p className='text-2xl font-mono whitespace-pre-wrap leading-relaxed'>
              {targetText.split('').map((char, index) => {
                let color = 'text-gray-500';
                let underline = '';

                if (index < userInput.length) {
                  const isCorrect = char === userInput[index];
                  color = isCorrect ? 'text-green-400' : 'text-red-500';
                  if (!isCorrect && char === ' ') underline = 'underline bg-red-500/20';
                }

                return (
                    <span key={index} className={`${color} ${underline}`}>
                  {char}
                </span>
                );
              })}
            </p>
          </div>

          {/* Input Principal */}
          <input
              ref={inputRef}
              className='mt-8 w-full p-5 rounded-xl bg-white text-black text-2xl shadow-inner focus:outline-none focus:ring-4 focus:ring-green-500/50 transition-all'
              disabled={(player && player.progress === 100) || (partieState.state === GameState.Finished || partieState.state === GameState.Loby)}
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="off"
              spellCheck="false"
              value={userInput}
              onChange={handleChange}
              placeholder="Start typing here..."
          />
        </div>

        {/* Pantalla de Fin de Juego */}
        {(partieState.state === GameState.Finished || partieState.state === GameState.Loby) && (

            <div className="text-center mt-10 ">
              <h1 className="text-5xl py-2 font-black text-red-500 animate-bounce">GAME OVER</h1>
              <button
                  className='border border-blue-500/50 text-blue-500 mt-8 py-2 px-10 rounded-xl text-xl
                       hover:-translate-y-1 transition-all
                       hover:shadow-[0_0_35px_rgba(59,130,246,0.6)]
                       hover:bg-blue-500/10'
                  onClick={goBackToLoby}
              >
                Loby
              </button>

            </div>
        )}
      </div>
  );
}