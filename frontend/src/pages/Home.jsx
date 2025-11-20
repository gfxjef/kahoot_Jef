import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../context/GameContext';

const Home = () => {
    const [pin, setPin] = useState('');
    const [nickname, setNickname] = useState('');
    const { socket, setGameState } = useContext(GameContext);
    const navigate = useNavigate();

    const joinGame = () => {
        if (!pin || !nickname) return;

        socket.connect();
        socket.emit('join_game', { pin, nickname });
    };

    useEffect(() => {
        socket.on('joined_success', (data) => {
            setGameState(prev => ({
                ...prev,
                gameId: data.game_id,
                playerId: data.player_id,
                nickname: nickname
            }));
            navigate('/lobby');
        });

        socket.on('error', (err) => {
            alert(err.message);
        });

        return () => {
            socket.off('joined_success');
            socket.off('error');
        };
    }, [socket, navigate, nickname, setGameState]);

    return (
        <div className="card">
            <h1>Kahoot Clone</h1>
            <input
                type="text"
                placeholder="Game PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
            />
            <br />
            <input
                type="text"
                placeholder="Nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
            />
            <br />
            <button onClick={joinGame}>Entrar</button>
        </div>
    );
};

export default Home;
