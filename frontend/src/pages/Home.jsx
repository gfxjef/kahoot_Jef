import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../context/GameContext';
import { AuthContext } from '../context/AuthContext';

const Home = () => {
    const [pin, setPin] = useState('');
    const pinRef = React.useRef('');
    const { user } = useContext(AuthContext);
    const [nickname, setNickname] = useState('');

    useEffect(() => {
        if (user) {
            setNickname(user.nombre || user.usuario);
        }
    }, [user]);

    const { socket, setGameState } = useContext(GameContext);
    const navigate = useNavigate();

    const handlePinChange = (e) => {
        const val = e.target.value;
        setPin(val);
        pinRef.current = val;
    };

    const joinGame = () => {
        if (!pin || !nickname) return;

        if (!socket.connected) {
            socket.connect();
        }

        socket.emit('join_game', { pin, nickname });
    };

    useEffect(() => {
        socket.on('joined_success', (data) => {
            const currentPin = pinRef.current;
            setGameState(prev => ({
                ...prev,
                gameId: data.game_id,
                playerId: data.player_id,
                nickname: nickname,
                pin: currentPin,
                isGameOver: false,
                score: 0,
                currentQuestion: null,
                isGameStarted: false
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
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="text-center mb-12 animate-fade-in">
                    <h1 className="text-6xl font-black text-white tracking-tighter mb-2">Kahoot!</h1>
                    <p className="text-slate-400 text-lg">Corporate Edition</p>
                </div>

                <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-700 shadow-2xl animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <div className="mb-8 text-center">
                        <p className="text-slate-400 mb-2">Bienvenido,</p>
                        <h2 className="text-2xl font-bold text-white">{nickname || 'Invitado'}</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <input
                                type="text"
                                placeholder="PIN del Juego"
                                value={pin}
                                onChange={handlePinChange}
                                className="w-full bg-slate-900/50 border-2 border-slate-700 text-white text-center text-3xl font-bold py-4 rounded-xl focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                                maxLength="7"
                            />
                        </div>

                        <button
                            onClick={joinGame}
                            disabled={!pin}
                            className="w-full bg-white text-slate-900 font-black text-xl py-4 rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                        >
                            Entrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
