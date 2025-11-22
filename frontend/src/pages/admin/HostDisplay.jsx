import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GameContext } from '../../context/GameContext';

const HostDisplay = () => {
    const { pin } = useParams();
    const { socket } = useContext(GameContext);

    const [players, setPlayers] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [viewState, setViewState] = useState('LOBBY'); // LOBBY, QUESTION, LEADERBOARD, END
    const [timeLeft, setTimeLeft] = useState(20);

    useEffect(() => {
        if (!socket) return;

        socket.connect();
        socket.emit('join_game', { pin, nickname: 'HOST_DISPLAY' });

        const handlePlayerJoined = (data) => {
            if (data.nickname !== 'ADMIN' && data.nickname !== 'HOST_DISPLAY') {
                setPlayers(prev => {
                    if (!prev.some(p => p.nickname === data.nickname)) {
                        return [...prev, { nickname: data.nickname }];
                    }
                    return prev;
                });
            }
        };

        const handleNewQuestion = (q) => {
            setCurrentQuestion(q);
            setViewState('QUESTION');
            setTimeLeft(20);

            // Simple timer for visual effect
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 0) {
                        clearInterval(timer);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        };

        const handleLeaderboard = (data) => {
            setLeaderboard(data);
            setViewState('LEADERBOARD');
        };

        const handleGameOver = () => {
            setViewState('END');
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

    if (viewState === 'LOBBY') {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-purple-600/20 rounded-full blur-[100px] animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-blue-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="relative z-10 text-center w-full max-w-6xl">
                    <div className="mb-12 animate-fade-in">
                        <h2 className="text-3xl text-slate-400 font-medium tracking-widest uppercase mb-4">Únete en</h2>
                        <h1 className="text-8xl font-black text-white mb-8 tracking-tight">
                            kahoot.it
                        </h1>
                        <div className="inline-block bg-white text-slate-900 px-12 py-6 rounded-3xl shadow-[0_0_50px_rgba(255,255,255,0.3)] animate-bounce">
                            <span className="block text-2xl font-bold text-slate-500 uppercase tracking-wider mb-1">Game PIN</span>
                            <span className="block text-8xl font-black tracking-tighter">{pin}</span>
                        </div>
                    </div>

                    <div className="mt-16">
                        <div className="flex justify-between items-end mb-6 border-b border-slate-700 pb-4">
                            <h3 className="text-2xl text-slate-400 font-bold flex items-center gap-3">
                                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                                Jugadores en sala
                            </h3>
                            <span className="text-4xl font-black text-white">{players.length}</span>
                        </div>

                        {players.length === 0 ? (
                            <div className="text-slate-600 text-2xl font-light italic animate-pulse">Esperando jugadores...</div>
                        ) : (
                            <div className="flex flex-wrap justify-center gap-4">
                                {players.map((p, i) => (
                                    <div key={i} className="bg-slate-800/80 backdrop-blur border border-slate-600 text-white px-6 py-3 rounded-xl text-xl font-bold shadow-lg animate-fade-in transform hover:scale-110 transition-transform duration-300">
                                        {p.nickname}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (viewState === 'QUESTION' && currentQuestion) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col p-8 relative">
                {/* Timer Bar */}
                <div className="w-full h-4 bg-slate-800 rounded-full mb-8 overflow-hidden">
                    <div
                        className="h-full bg-purple-500 transition-all duration-1000 ease-linear"
                        style={{ width: `${(timeLeft / 20) * 100}%` }}
                    ></div>
                </div>

                <div className="flex-1 flex flex-col items-center justify-center max-w-7xl mx-auto w-full">
                    <div className="bg-white text-slate-900 p-12 rounded-3xl shadow-2xl mb-12 w-full text-center transform transition-all hover:scale-[1.01]">
                        <h2 className="text-5xl md:text-6xl font-black leading-tight">
                            {currentQuestion.text}
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 gap-6 w-full h-[40vh]">
                        {currentQuestion.options.map((opt, i) => {
                            const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
                            const icons = ['▲', '◆', '●', '■'];

                            return (
                                <div key={i} className={`${colors[i]} rounded-2xl flex items-center p-8 shadow-xl transform transition-transform hover:scale-[1.02]`}>
                                    <span className="text-6xl text-black/20 font-black mr-8">{icons[i]}</span>
                                    <span className="text-4xl md:text-5xl font-bold text-white drop-shadow-md">{opt}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    if (viewState === 'LEADERBOARD') {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8">
                <h1 className="text-6xl font-black text-white mb-16 tracking-tight">Ranking</h1>

                <div className="w-full max-w-4xl space-y-4">
                    {leaderboard.slice(0, 5).map((player, index) => (
                        <div
                            key={index}
                            className="bg-slate-800 flex items-center justify-between p-6 rounded-2xl border border-slate-700 shadow-xl transform transition-all hover:scale-105"
                            style={{ animationDelay: `${index * 100}ms` }}
                        >
                            <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 flex items-center justify-center rounded-full text-2xl font-black ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                    index === 1 ? 'bg-slate-300 text-slate-900' :
                                        index === 2 ? 'bg-orange-400 text-orange-900' :
                                            'bg-slate-700 text-slate-400'
                                    }`}>
                                    {index + 1}
                                </div>
                                <span className="text-3xl font-bold text-white">{player.nickname}</span>
                            </div>
                            <span className="text-3xl font-black text-purple-400">{player.score} pts</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (viewState === 'END') {
        const top3 = leaderboard.slice(0, 3);
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-8 relative overflow-hidden">
                {/* Confetti / Celebration Effects */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-500 rounded-full animate-bounce" style={{ animationDuration: '2s' }}></div>
                    <div className="absolute top-10 right-1/4 w-3 h-3 bg-red-500 transform rotate-45 animate-pulse"></div>
                    <div className="absolute top-1/3 left-10 w-4 h-4 bg-blue-500 rounded-full animate-bounce" style={{ animationDuration: '3s' }}></div>
                    {/* Add more subtle particles if needed */}
                </div>

                <h1 className="text-7xl font-black text-white mb-20 tracking-tighter animate-fade-in">
                    Podio Final
                </h1>

                <div className="flex items-end justify-center gap-8 w-full max-w-6xl h-[50vh]">
                    {/* 2nd Place */}
                    {top3[1] && (
                        <div className="flex flex-col items-center w-1/3 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                            <div className="mb-4 text-center">
                                <span className="block text-3xl font-bold text-slate-300 mb-2">{top3[1].nickname}</span>
                                <span className="block text-2xl font-bold text-slate-500">{top3[1].score} pts</span>
                            </div>
                            <div className="w-full h-[60%] bg-slate-300 rounded-t-3xl relative shadow-[0_0_30px_rgba(203,213,225,0.3)] flex items-end justify-center pb-8">
                                <span className="text-6xl font-black text-slate-500 opacity-50">2</span>
                            </div>
                        </div>
                    )}

                    {/* 1st Place */}
                    {top3[0] && (
                        <div className="flex flex-col items-center w-1/3 z-10 animate-fade-in" style={{ animationDelay: '1s' }}>
                            <div className="mb-6 text-center transform scale-110">
                                <span className="text-6xl mb-4 block">👑</span>
                                <span className="block text-5xl font-black text-yellow-400 mb-2 drop-shadow-lg">{top3[0].nickname}</span>
                                <span className="block text-3xl font-bold text-yellow-200">{top3[0].score} pts</span>
                            </div>
                            <div className="w-full h-[80%] bg-yellow-400 rounded-t-3xl relative shadow-[0_0_50px_rgba(250,204,21,0.5)] flex items-end justify-center pb-8">
                                <span className="text-8xl font-black text-yellow-700 opacity-50">1</span>
                            </div>
                        </div>
                    )}

                    {/* 3rd Place */}
                    {top3[2] && (
                        <div className="flex flex-col items-center w-1/3 animate-fade-in" style={{ animationDelay: '0.7s' }}>
                            <div className="mb-4 text-center">
                                <span className="block text-3xl font-bold text-orange-300 mb-2">{top3[2].nickname}</span>
                                <span className="block text-2xl font-bold text-orange-500">{top3[2].score} pts</span>
                            </div>
                            <div className="w-full h-[50%] bg-orange-400 rounded-t-3xl relative shadow-[0_0_30px_rgba(251,146,60,0.3)] flex items-end justify-center pb-8">
                                <span className="text-6xl font-black text-orange-800 opacity-50">3</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
    );
};

export default HostDisplay;
