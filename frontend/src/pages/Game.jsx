import React, { useContext, useState, useEffect } from 'react';
import { GameContext } from '../context/GameContext';

const Game = () => {
    const { gameState, socket } = useContext(GameContext);
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);

    const submitAnswer = (index) => {
        if (hasAnswered) return;

        setHasAnswered(true);
        socket.emit('submit_answer', {
            player_id: gameState.playerId,
            answer_index: index
        });
    };

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

    if (gameState.isGameOver) {
        return (
            <div className="card">
                <h1>¡Juego Terminado!</h1>
                <p>Tu puntuación final: {gameState.score}</p>
            </div>
        );
    }

    if (!gameState.currentQuestion) {
        return (
            <div className="card">
                <h1>¡Prepárate!</h1>
                <div className="loader">Cargando pregunta...</div>
            </div>
        );
    }

    if (hasAnswered) {
        return (
            <div className="card">
                {isCorrect === null ? (
                    <h1>Respuesta enviada...</h1>
                ) : (
                    <div style={{ background: isCorrect ? '#26890c' : '#e21b3c', padding: '2rem', borderRadius: '16px' }}>
                        <h1>{isCorrect ? '¡Correcto!' : 'Incorrecto'}</h1>
                        <p>{isCorrect ? '+100 Puntos' : '¡Ánimo para la próxima!'}</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div style={{ width: '100%', maxWidth: '800px' }}>
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h2>{gameState.currentQuestion.text}</h2>
            </div>

            <div className="grid-options">
                {gameState.currentQuestion.options.map((option, index) => (
                    <button
                        key={index}
                        className={`option-btn opt-${index}`}
                        onClick={() => submitAnswer(index)}
                    >
                        {option}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Game;
