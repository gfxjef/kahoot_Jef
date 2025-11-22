import React, { useState, useContext, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GameContext } from '../../context/GameContext';

const HostControl = () => {
    const { pin } = useParams();
    const navigate = useNavigate();
    const { socket } = useContext(GameContext);

    const [players, setPlayers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [gameStatus, setGameStatus] = useState('LOBBY'); // LOBBY, QUESTION, LEADERBOARD, END

    useEffect(() => {
        if (!socket) return;

        socket.connect();
        socket.emit('join_game', { pin, nickname: 'ADMIN' });

        const handlePlayerJoined = (data) => {
            if (data.nickname !== 'ADMIN') {
                setPlayers(prev => [...prev, data.nickname]);
            }
        };

        const handleNewQuestion = (q) => {
            setCurrentQuestion(q);
            setGameStatus('QUESTION');
        };

        const handleLeaderboard = (data) => {
            setLeaderboard(data);
            // If we receive leaderboard, it usually means a question ended or game over
            // But let's rely on explicit state or just show it.
        };

        const handleGameOver = () => {
            setGameStatus('END');
        };

        socket.on('player_joined', handlePlayerJoined);
        socket.on('new_question', handleNewQuestion);
        socket.on('update_leaderboard', handleLeaderboard);
        socket.on('game_over', handleGameOver);

        return () => {
            socket.off('player_joined', handlePlayerJoined);
            socket.off('new_question', handleNewQuestion);
            socket.off('update_leaderboard', handleLeaderboard);
            socket.off('game_over', handleGameOver);
        };
    }, [socket, pin]);

    const startGame = () => {
        socket.emit('start_game', { pin });
    };

    const nextQuestion = () => {
        socket.emit('next_question', { pin });
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-md mx-auto bg-gray-800 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="bg-purple-900 p-4 flex justify-between items-center">
                    <div>
                        <h2 className="font-bold text-lg">Control de Host</h2>
                        <p className="text-xs text-purple-300">PIN: {pin}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold">{players.length}</p>
                        <p className="text-xs text-purple-300">Jugadores</p>
                    </div>
                </div>

                {/* Controls */}
                <div className="p-6 flex flex-col gap-4">
                    {gameStatus === 'LOBBY' && (
                        <button
                            onClick={startGame}
                            className="w-full py-4 bg-green-600 hover:bg-green-700 rounded-lg font-bold text-xl shadow-lg transform transition active:scale-95"
                        >
                            EMPEZAR JUEGO ▶
                        </button>
                    )}

                    {(gameStatus === 'QUESTION' || gameStatus === 'LEADERBOARD') && (
                        <button
                            onClick={nextQuestion}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold text-xl shadow-lg transform transition active:scale-95"
                        >
                            SIGUIENTE ⏭
                        </button>
                    )}

                    {gameStatus === 'END' && (
                        <div className="text-center py-4">
                            <p className="text-xl font-bold text-yellow-400 mb-4">¡Juego Terminado!</p>
                            <button
                                onClick={() => navigate('/admin/dashboard')}
                                className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg"
                            >
                                Volver al Dashboard
                            </button>
                        </div>
                    )}
                </div>

                {/* Status Monitor (Small) */}
                <div className="bg-gray-900 p-4 border-t border-gray-700">
                    <p className="text-xs text-gray-500 uppercase mb-2">Monitor de Estado</p>
                    {currentQuestion ? (
                        <div>
                            <p className="text-sm font-bold truncate">{currentQuestion.text}</p>
                            <p className="text-xs text-gray-400 mt-1">Pregunta {currentQuestion.index + 1}</p>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-400 italic">Esperando inicio...</p>
                    )}
                </div>

                {/* Link to Display */}
                <div className="p-4 bg-black/20 text-center">
                    <a
                        href={`/host/${pin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:underline"
                    >
                        Abrir Pantalla Pública (Proyector) ↗
                    </a>
                </div>
            </div>
        </div>
    );
};

export default HostControl;
