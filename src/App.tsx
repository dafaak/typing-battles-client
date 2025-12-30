import './App.css'
import { Loby } from './pages/Loby';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { useEffect } from "react";
import { GameState, GameStatus } from "./interfaces/GameStatus.ts";
import { setPlayers } from "./redux/playersSlice.ts";
import { useSocket } from "./context/SocketContext.tsx";
import { useDispatch } from "react-redux";
import { Player } from "./interfaces/Player.ts";
import { setPlayerData } from "./redux/playerDataSlice.ts";
import { setPartie, setText } from "./redux/partieSlice.ts";
import { Game } from "./pages/Game.tsx";


function App() {
  const navigate = useNavigate();
  const socket = useSocket();
  const dispatch = useDispatch();


  useEffect(() => {
    if (!socket) return; // Seguridad por si el socket no está inicializado

    function onGameUpdate(data: string) {
      const gameStatus: GameStatus = JSON.parse(data);
      dispatch(setPartie({state: gameStatus.state, name: gameStatus.name}));
      dispatch(setPlayers(gameStatus.players));
      console.log(gameStatus.state);
      if (gameStatus.state === GameState.Ready) {
        // Usamos optional chaining y fallback para evitar errores
        dispatch(setText(gameStatus.targetString?.trim() || ""));
      }

      if (gameStatus.state === GameState.Running) {
        navigate('/game');
      }

    }

    function onJoinSuccess(data: string) {
      const playerData: Player = JSON.parse(data);
      dispatch(setPlayerData(playerData));
      navigate('/loby');
    }

    // Suscripciones
    socket.on('join-room-success', onJoinSuccess);
    socket.on('game-update', onGameUpdate);

    // Limpieza CORRECTA
    return () => {
      socket.off('join-room-success', onJoinSuccess);
      socket.off('game-update', onGameUpdate); // <--- Corregido el nombre del evento
    };
  }, [socket, dispatch, navigate]); // Añade 'navigate' a las dependencias

  return (
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/loby" element={<Loby/>}/>
        <Route path="/game" element={<Game/>}/>
      </Routes>
  )
}

export default App
