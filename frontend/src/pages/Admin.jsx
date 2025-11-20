import React, { useState, useContext } from 'react';
import { GameContext } from '../context/GameContext';

const Admin = () => {
    const { socket } = useContext(GameContext);
    const [pin, setPin] = useState(null);
    const [gameId, setGameId] = useState(null);
    const [isGameStarted, setIsGameStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [players, setPlayers] = useState([]);
    const [leaderboard, setLeaderboard] = useState([]);
    const [addedQuestions, setAddedQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState({
        text: '',
        options: ['', '', '', ''],
        correct_index: 0
    });

    const createGame = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/create_game', {
                method: 'POST'
            });
            const data = await response.json();
            setPin(data.pin);
            setGameId(data.game_id);
            setAddedQuestions([]); // Reset questions

            // Admin joins the room too to listen for events
            socket.connect();
            socket.emit('join_game', { pin: data.pin, nickname: 'ADMIN' });
        } catch (error) {
            console.error("Error creating game:", error);
        }
    };

    const startGame = () => {
        socket.emit('start_game', { pin });
        setIsGameStarted(true);
    };

    const nextQuestion = () => {
        socket.emit('next_question', { pin });
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...newQuestion.options];
        newOptions[index] = value;
        setNewQuestion({ ...newQuestion, options: newOptions });
    };

    const addQuestion = async () => {
        if (!newQuestion.text || newQuestion.options.some(opt => !opt)) {
            alert("Completa todos los campos");
            return;
        }

        try {
            await fetch('http://localhost:5000/api/add_question', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    game_id: gameId,
                    text: newQuestion.text,
                    options: newQuestion.options,
                    correct_index: parseInt(newQuestion.correct_index)
                })
            });

            // Add to local state for visualization
            setAddedQuestions([...addedQuestions, { ...newQuestion, correct_index: parseInt(newQuestion.correct_index) }]);

            alert("Pregunta añadida!");
            setNewQuestion({ text: '', options: ['', '', '', ''], correct_index: 0 });
        } catch (error) {
            console.error("Error adding question:", error);
        }
    };

    // Listen for question updates to show admin what's happening
    React.useEffect(() => {
        const handlePlayerJoined = (data) => {
            if (data.nickname !== 'ADMIN') {
                setPlayers(prev => [...prev, data.nickname]);
            }
        };

        const handleNewQuestion = (q) => {
            setCurrentQuestion(q);
        };

        const handleLeaderboard = (data) => {
            setLeaderboard(data);
        };

        const handleGameOver = () => {
            setCurrentQuestion('GAME OVER');
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
    }, [socket]);

    return (
        <div className="card" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Admin Panel</h1>

            {!pin ? (
                <button onClick={createGame} className="btn-primary" style={{ fontSize: '1.2rem', padding: '1rem 2rem' }}>
                    Crear Nueva Partida
                </button>
            ) : (
                <div>
                    <div className="status-badge" style={{ fontSize: '1.5rem', padding: '0.5rem 1.5rem', marginBottom: '1rem' }}>
                        PIN: {pin}
                    </div>
                    <p style={{ opacity: 0.8, marginBottom: '2rem' }}>Comparte este PIN con los jugadores</p>

                    {!isGameStarted ? (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
                            {/* Left Panel: Added Questions List */}
                            <div style={{
                                background: 'rgba(255,255,255,0.05)',
                                padding: '1.5rem',
                                borderRadius: '12px',
                                maxHeight: '600px',
                                overflowY: 'auto',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}>
                                <h3 style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                                    Preguntas Creadas ({addedQuestions.length})
                                </h3>
                                {addedQuestions.length === 0 ? (
                                    <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>
                                        <p>No hay preguntas aún.</p>
                                        <p style={{ fontSize: '0.9rem' }}>Usa el formulario de la derecha para añadir una.</p>
                                    </div>
                                ) : (
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {addedQuestions.map((q, i) => (
                                            <li key={i} style={{
                                                marginBottom: '1rem',
                                                background: 'rgba(0,0,0,0.2)',
                                                padding: '1rem',
                                                borderRadius: '8px',
                                                borderLeft: '4px solid #4ade80'
                                            }}>
                                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', fontSize: '1.1rem' }}>
                                                    {i + 1}. {q.text}
                                                </div>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                                                    {q.options.map((opt, optIndex) => (
                                                        <div key={optIndex} style={{
                                                            padding: '4px 8px',
                                                            borderRadius: '4px',
                                                            background: optIndex === q.correct_index ? 'rgba(74, 222, 128, 0.2)' : 'rgba(255,255,255,0.05)',
                                                            color: optIndex === q.correct_index ? '#4ade80' : 'inherit',
                                                            border: optIndex === q.correct_index ? '1px solid rgba(74, 222, 128, 0.3)' : 'none'
                                                        }}>
                                                            {opt} {optIndex === q.correct_index && '✓'}
                                                        </div>
                                                    ))}
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {/* Right Panel: Add Question Form & Controls */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                                <div style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '2rem',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                                }}>
                                    <h3 style={{ marginBottom: '1.5rem' }}>Añadir Pregunta</h3>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>Enunciado</label>
                                        <input
                                            type="text"
                                            placeholder="Escribe tu pregunta aquí..."
                                            value={newQuestion.text}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: 'rgba(255,255,255,0.9)', color: '#333' }}
                                        />
                                    </div>

                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', opacity: 0.8 }}>Opciones</label>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1.5rem' }}>
                                        {newQuestion.options.map((opt, i) => (
                                            <input
                                                key={i}
                                                type="text"
                                                placeholder={`Opción ${i + 1}`}
                                                value={opt}
                                                onChange={(e) => handleOptionChange(i, e.target.value)}
                                                style={{ padding: '10px', borderRadius: '6px', border: 'none', background: 'rgba(255,255,255,0.9)', color: '#333' }}
                                            />
                                        ))}
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{ marginRight: '1rem' }}>Respuesta Correcta:</label>
                                        <select
                                            value={newQuestion.correct_index}
                                            onChange={(e) => setNewQuestion({ ...newQuestion, correct_index: e.target.value })}
                                            style={{ padding: '0.5rem', borderRadius: '4px', border: 'none', background: 'white', color: '#333', cursor: 'pointer' }}
                                        >
                                            <option value={0}>Opción 1</option>
                                            <option value={1}>Opción 2</option>
                                            <option value={2}>Opción 3</option>
                                            <option value={3}>Opción 4</option>
                                        </select>
                                    </div>

                                    <button onClick={addQuestion} style={{ width: '100%', padding: '1rem', background: '#4ade80', color: '#064e3b', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1rem' }}>
                                        + Guardar Pregunta
                                    </button>
                                </div>

                                <div style={{ textAlign: 'center' }}>
                                    <h3 style={{ marginBottom: '1rem' }}>Jugadores en sala: {players.length}</h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginBottom: '2rem', minHeight: '50px' }}>
                                        {players.length === 0 ? (
                                            <span style={{ opacity: 0.5, fontStyle: 'italic' }}>Esperando jugadores...</span>
                                        ) : (
                                            players.map((p, i) => (
                                                <span key={i} style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 16px', borderRadius: '20px', fontWeight: 'bold' }}>
                                                    {p}
                                                </span>
                                            ))
                                        )}
                                    </div>
                                    <button onClick={startGame} disabled={addedQuestions.length === 0} style={{
                                        fontSize: '1.5rem',
                                        padding: '1rem 3rem',
                                        background: addedQuestions.length === 0 ? '#666' : 'linear-gradient(45deg, #ff0080, #7928ca)',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '50px',
                                        cursor: addedQuestions.length === 0 ? 'not-allowed' : 'pointer',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                                        transition: 'transform 0.2s'
                                    }}>
                                        Empezar Juego 🚀
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ marginTop: '2rem' }}>
                            <h2>Control de Juego</h2>

                            {/* Leaderboard Section */}
                            <div style={{ margin: '2rem 0', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px' }}>
                                <h3>🏆 Ranking en Vivo</h3>
                                {leaderboard.length === 0 ? <p>Esperando respuestas...</p> : (
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {leaderboard.map((p, i) => (
                                            <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                                <span>#{i + 1} {p.nickname}</span>
                                                <strong>{p.score} pts</strong>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            {currentQuestion === 'GAME OVER' ? (
                                <h3>¡Juego Terminado!</h3>
                            ) : (
                                <div>
                                    <p>Pregunta Actual: {currentQuestion ? currentQuestion.text : 'Esperando...'}</p>
                                    <button onClick={nextQuestion}>
                                        Siguiente Pregunta
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Admin;
