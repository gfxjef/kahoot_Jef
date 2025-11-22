import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../context/GameContext';

const Lobby = () => {
    const { gameState, socket } = useContext(GameContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (gameState.isGameStarted || gameState.currentQuestion) {
            navigate('/game');
        }

        socket.on('game_started', () => {
            navigate('/game');
        });

        return () => {
            socket.off('game_started');
        };
    }, [gameState.isGameStarted, navigate, socket]);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-green-600/20 rounded-full blur-[120px] animate-pulse"></div>
            </div>

            <div className="relative z-10 text-center w-full max-w-md animate-fade-in">
                <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-700 shadow-2xl">
                    <h1 className="text-4xl font-black text-white mb-2">¡Ya estás dentro!</h1>
                    <p className="text-slate-400 mb-8">¿Ves tu nombre en la pantalla?</p>

                    <div className="bg-slate-900/50 border-2 border-slate-700 rounded-xl p-6 mb-8 transform hover:scale-105 transition-transform">
                        <span className="text-3xl font-bold text-white block">{gameState.nickname}</span>
                    </div>

                    <div className="flex items-center justify-center gap-3 text-slate-400">
                        <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce"></span>
                        <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                        <span className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                        <span className="ml-2">Esperando al anfitrión...</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lobby;
