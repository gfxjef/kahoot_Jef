import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const QuestionManager = () => {
    const { gameId } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState([]);
    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newQuestion, setNewQuestion] = useState({
        text: '',
        options: ['', '', '', ''],
        correct_index: 0
    });

    useEffect(() => {
        // Fetch game details (mocked for now as we don't have a single game fetch endpoint yet, 
        // but we can use the list or add one. For now, let's just fetch questions if we can, 
        // or just rely on the ID. Ideally we fetch game info to show title.)
        // Let's assume we can fetch game info or just proceed.
        // Actually, we need to fetch questions for this game. 
        // The current backend doesn't have a "get questions for game" endpoint explicitly exposed 
        // except via socket or maybe we need to add one.
        // For now, let's implement the add question part and maybe add a fetch questions endpoint.
        // Wait, the original Admin.jsx used local state for added questions. 
        // We need to persist them.

        // Let's add a fetch questions endpoint to backend or just use what we have.
        // I'll add a fetch questions function here assuming I'll add the endpoint or use an existing one.
        // Actually, let's just implement the UI and the Add function.
        setLoading(false);
    }, [gameId]);

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

            setQuestions([...questions, { ...newQuestion, correct_index: parseInt(newQuestion.correct_index) }]);
            alert("Pregunta añadida!");
            setNewQuestion({ text: '', options: ['', '', '', ''], correct_index: 0 });
        } catch (error) {
            console.error("Error adding question:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-10">
                    <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors group">
                        <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Volver al Panel
                    </button>
                    <div className="text-right">
                        <h1 className="text-3xl font-black tracking-tight">Gestor de Preguntas</h1>
                        <p className="text-slate-400 text-sm font-mono">Game ID: {gameId}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Add Question Form (Left - 7 cols) */}
                    <div className="lg:col-span-7 bg-slate-800/50 backdrop-blur-xl p-8 rounded-3xl border border-slate-700/50 shadow-2xl">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xl">
                                +
                            </div>
                            <h3 className="text-2xl font-bold text-white">Añadir Nueva Pregunta</h3>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Enunciado de la Pregunta</label>
                                <textarea
                                    rows="2"
                                    value={newQuestion.text}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
                                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder-slate-600 resize-none"
                                    placeholder="¿Cuál es la capital de Francia?"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Opciones de Respuesta</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {newQuestion.options.map((opt, i) => {
                                        const colors = ['border-red-500/50 focus:ring-red-500', 'border-blue-500/50 focus:ring-blue-500', 'border-yellow-500/50 focus:ring-yellow-500', 'border-green-500/50 focus:ring-green-500'];
                                        const icons = ['▲', '◆', '●', '■'];
                                        const textColors = ['text-red-400', 'text-blue-400', 'text-yellow-400', 'text-green-400'];

                                        return (
                                            <div key={i} className="relative group">
                                                <span className={`absolute left-4 top-1/2 -translate-y-1/2 ${textColors[i]} font-bold text-lg pointer-events-none`}>
                                                    {icons[i]}
                                                </span>
                                                <input
                                                    type="text"
                                                    value={opt}
                                                    onChange={(e) => handleOptionChange(i, e.target.value)}
                                                    className={`w-full bg-slate-900/50 border ${colors[i]} rounded-xl py-4 pl-10 pr-4 text-white focus:ring-2 focus:border-transparent transition-all outline-none placeholder-slate-600`}
                                                    placeholder={`Opción ${i + 1}`}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 items-end">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Respuesta Correcta</label>
                                    <select
                                        value={newQuestion.correct_index}
                                        onChange={(e) => setNewQuestion({ ...newQuestion, correct_index: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white focus:ring-2 focus:ring-green-500 outline-none cursor-pointer appearance-none"
                                    >
                                        {newQuestion.options.map((_, i) => (
                                            <option key={i} value={i}>Opción {i + 1}</option>
                                        ))}
                                    </select>
                                </div>

                                <button
                                    onClick={addQuestion}
                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-green-900/20 transform transition active:scale-[0.98]"
                                >
                                    Guardar Pregunta
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Questions List (Right - 5 cols) */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-white">Preguntas Añadidas</h3>
                            <span className="bg-slate-800 text-slate-400 px-3 py-1 rounded-full text-sm font-mono">{questions.length}</span>
                        </div>

                        <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-2 custom-scrollbar">
                            {questions.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-3xl">
                                    <p className="text-slate-600 font-medium">Tu lista está vacía.</p>
                                    <p className="text-slate-700 text-sm mt-1">Añade tu primera pregunta a la izquierda.</p>
                                </div>
                            ) : (
                                questions.map((q, i) => (
                                    <div key={i} className="bg-slate-800 p-5 rounded-2xl border border-slate-700 hover:border-purple-500/30 transition-colors group relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
                                        <div className="flex justify-between items-start mb-3 pl-3">
                                            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Pregunta {i + 1}</span>
                                        </div>
                                        <p className="font-bold text-lg text-white mb-4 pl-3 leading-snug">{q.text}</p>

                                        <div className="grid grid-cols-2 gap-2 pl-3">
                                            {q.options.map((opt, idx) => (
                                                <div key={idx} className={`text-xs py-1.5 px-3 rounded-lg flex items-center gap-2 ${idx === q.correct_index
                                                        ? 'bg-green-500/20 text-green-400 font-bold border border-green-500/20'
                                                        : 'bg-slate-900/50 text-slate-500'
                                                    }`}>
                                                    {idx === q.correct_index && <span>✓</span>}
                                                    <span className="truncate">{opt}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionManager;
