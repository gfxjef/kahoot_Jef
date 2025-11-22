import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../context/GameContext';

const Game = () => {
    const { gameState, socket, setGameState } = useContext(GameContext);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);
    const navigate = useNavigate();

    const submitAnswer = (index) => {
        if (hasAnswered) return;

        setHasAnswered(true);
        socket.emit('submit_answer', {
            player_id: gameState.playerId,
            answer_index: index,
            pin: gameState.pin,
            question_index: gameState.currentQuestion.index
        });
    };

    useEffect(() => {
        if (!gameState.pin) {
            const saved = JSON.parse(localStorage.getItem('gameState') || '{}');
            if (saved.pin) {
                setGameState(prev => ({ ...prev, pin: saved.pin }));
                return;
            }
            alert("Error de sesión: Falta el PIN del juego. Por favor, vuelve a entrar.");
            navigate('/');
        }
    }, [gameState.pin, navigate, setGameState]);

    useEffect(() => {
        const handleAnswerResult = (data) => {
            setIsCorrect(data.correct);
        };

        const handleNewQuestion = () => {
            setHasAnswered(false);
            setIsCorrect(null);
        };

        socket.on('answer_result', handleAnswerResult);
        socket.on('new_question', handleNewQuestion);

        return () => {
            socket.off('answer_result', handleAnswerResult);
            socket.off('new_question', handleNewQuestion);
        };
    }, [socket]);

    // Game Over View
    if (gameState.isGameOver) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
                <div className="bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-700 shadow-2xl text-center w-full max-w-md animate-fade-in">
                    <h1 className="text-4xl font-black text-white mb-4">¡Juego Terminado!</h1>
                    <div className="bg-slate-900/50 rounded-xl p-6 mb-8">
                        <p className="text-slate-400 text-sm uppercase tracking-wider mb-2">Puntuación Final</p>
                        <p className="text-5xl font-black text-purple-400">{gameState.score}</p>
                    </div>
                    <button
                        onClick={() => {
                            setGameState(prev => ({ ...prev, isGameOver: false, score: 0, currentQuestion: null }));
                            navigate('/');
                        }}
                        className="w-full bg-white text-slate-900 font-bold py-4 rounded-xl hover:scale-[1.02] transition-transform"
                    >
                        Volver al Inicio
                    </button>
                </div>
            </div>
        );
    }

    // Loading / Waiting View
    if (!gameState.currentQuestion) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                <p className="text-white text-xl font-bold animate-pulse">¡Prepárate!</p>
            </div>
        );
    }

    // Answered / Feedback View
    if (hasAnswered) {
        return (
            <div className={`min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500 ${isCorrect === null ? 'bg-slate-900' :
                    isCorrect ? 'bg-green-600' : 'bg-red-600'
                }`}>
                <div className="text-center animate-fade-in">
                    {isCorrect === null ? (
                        <>
                            <div className="animate-spin rounded-full h-20 w-20 border-4 border-white/20 border-t-white mb-8 mx-auto"></div>
                            <h1 className="text-4xl font-black text-white">Respuesta enviada</h1>
                            <p className="text-white/60 mt-4 text-xl">Esperando resultados...</p>
                        </>
                    ) : (
                        <>
                            <div className="text-8xl mb-6 animate-bounce">
                                {isCorrect ? '🎉' : '😢'}
                            </div>
                            <h1 className="text-5xl font-black text-white mb-4">
                                {isCorrect ? '¡Correcto!' : 'Incorrecto'}
                            </h1>
                            <p className="text-white/80 text-2xl font-bold">
                                {isCorrect ? '+100 Puntos' : '¡Ánimo para la próxima!'}
                            </p>
                        </>
                    )}
                </div>
            </div>
        );
    }

    // Question / Answering View
    return (
        <div className="min-h-screen bg-slate-900 flex flex-col p-4">
            {/* Header Info */}
            <div className="flex justify-between items-center mb-6 text-slate-400 font-bold">
                <span>PIN: {gameState.pin}</span>
                <span>{gameState.nickname}</span>
                <span className="bg-slate-800 px-3 py-1 rounded-lg text-purple-400">{gameState.score} pts</span>
            </div>

            {/* Question Text (Optional, keeps focus on host screen usually, but good for mobile) */}
            <div className="bg-white text-slate-900 p-6 rounded-2xl shadow-lg mb-8 text-center min-h-[120px] flex items-center justify-center">
                <h2 className="text-xl md:text-2xl font-bold leading-tight">
                    {gameState.currentQuestion.text}
                </h2>
            </div>

            {/* Answer Grid */}
            <div className="grid grid-cols-2 gap-4 flex-1 pb-8">
                {gameState.currentQuestion.options.map((option, index) => {
                    const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
                    const icons = ['▲', '◆', '●', '■'];

                    return (
                        <button
                            key={index}
                            className={`${colors[index]} rounded-2xl flex flex-col items-center justify-center p-4 shadow-xl active:scale-95 transition-transform h-full`}
                            onClick={() => submitAnswer(index)}
                        >
                            <span className="text-5xl text-black/20 font-black mb-2">{icons[index]}</span>
                            <span className="text-white font-bold text-lg md:text-xl drop-shadow-md leading-tight">
                                {option}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default Game;
