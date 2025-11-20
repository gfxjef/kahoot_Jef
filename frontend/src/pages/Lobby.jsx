import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../context/GameContext';

const Lobby = () => {
    const { gameState, socket } = useContext(GameContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (gameState.isGameStarted) {
            navigate('/game');
        }

        // Also listen for direct event just in case context update is slow
        socket.on('game_started', () => {
            navigate('/game');
        });

        return () => {
            socket.off('game_started');
        };
    }, [gameState.isGameStarted, navigate, socket]);

    return (
        <div className="card">
            <h1>¡Ya estás dentro!</h1>
            <div className="status-badge">
                {gameState.nickname}
            </div>
            <p>¿Ves tu nombre en la pantalla?</p>
            <div className="loader" style={{ marginTop: '2rem' }}>
                Esperando a que el anfitrión empiece...
            </div>
        </div>
    );
};

export default Lobby;
