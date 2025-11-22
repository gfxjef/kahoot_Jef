import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [games, setGames] = useState([]);
    const [newGameTitle, setNewGameTitle] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchGames();
    }, []);

    const fetchGames = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/games');
            const data = await res.json();
            setGames(data);
        } catch (error) {
            console.error("Error fetching games:", error);
        }
    };

    const createGame = async () => {
        if (!newGameTitle.trim()) return;
        setLoading(true);
        try {
            const res = await fetch('http://localhost:5000/api/create_game', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newGameTitle })
            });
            if (res.ok) {
                setNewGameTitle('');
                fetchGames();
            }
        } catch (error) {
            console.error("Error creating game:", error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (gameId, newStatus) => {
        try {
            await fetch(`http://localhost:5000/api/game/${gameId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchGames();
        } catch (error) {
            console.error("Error updating status:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-50 p-8 font-sans">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Left Panel: Room Management */}
                <div className="lg:col-span-1 bg-slate-800/50 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 shadow-xl h-fit sticky top-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
                        <h2 className="text-xl font-bold tracking-tight text-white">Panel de Salas</h2>
                    </div>

                    <div className="mb-8">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Nueva Sala</label>
                        <div className="flex flex-col gap-3">
                            <input
                                type="text"
                                placeholder="Nombre de la sala..."
                                value={newGameTitle}
                                onChange={(e) => setNewGameTitle(e.target.value)}
                                className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 text-sm text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all outline-none placeholder-slate-500"
                            />
                            <button
                                onClick={createGame}
                                disabled={loading || !newGameTitle}
                                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-3 rounded-lg font-bold text-sm shadow-lg shadow-purple-900/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]"
                            >
                                {loading ? 'Creando...' : '+ Crear Sala'}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Salas Recientes</h3>
                            <span className="text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded-full">{games.length}</span>
                        </div>

                        {games.length === 0 && (
                            <div className="text-center py-8 border-2 border-dashed border-slate-700 rounded-xl">
                                <p className="text-slate-500 text-sm">No hay salas creadas.</p>
                            </div>
                        )}

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {games.map(game => (
                                <div key={game.id} className="group bg-slate-800 hover:bg-slate-750 p-4 rounded-xl border border-slate-700 hover:border-purple-500/30 transition-all duration-200">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="font-bold text-white truncate w-32 group-hover:text-purple-400 transition-colors" title={game.title}>{game.title}</h4>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-slate-400">PIN: {game.pin}</span>
                                            </div>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide ${game.status === 'ACTIVE' ? 'bg-green-500/10 text-green-400 border border-green-500/20' :
                                                game.status === 'FINISHED' ? 'bg-slate-700 text-slate-400' :
                                                    'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                            }`}>
                                            {game.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 gap-2 mt-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => navigate(`/admin/manage/${game.id}`)}
                                            className="text-xs font-medium bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                                        >
                                            <span>✏️</span> Editar
                                        </button>

                                        {game.status === 'PREPARED' && (
                                            <button
                                                onClick={() => updateStatus(game.id, 'ACTIVE')}
                                                className="text-xs font-bold bg-green-600/20 hover:bg-green-600/30 text-green-400 border border-green-600/30 py-2 rounded-lg transition-all"
                                            >
                                                ▶ Iniciar (Open)
                                            </button>
                                        )}

                                        {game.status === 'ACTIVE' && (
                                            <>
                                                <button
                                                    onClick={() => navigate(`/admin/control/${game.pin}`)}
                                                    className="text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white py-2 rounded-lg shadow-lg shadow-purple-900/20 transition-all"
                                                >
                                                    🎮 Controlar
                                                </button>
                                                <button
                                                    onClick={() => updateStatus(game.id, 'FINISHED')}
                                                    className="text-xs font-medium bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 py-2 rounded-lg transition-all"
                                                >
                                                    ⏹ Cerrar
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Welcome / Stats */}
                <div className="lg:col-span-3 flex flex-col gap-8">
                    {/* Hero Section */}
                    <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-10 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl transform translate-x-1/3 -translate-y-1/3 group-hover:bg-purple-600/20 transition-all duration-700"></div>

                        <div className="relative z-10">
                            <h1 className="text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400 tracking-tight">
                                Admin Dashboard
                            </h1>
                            <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">
                                Gestiona tus salas de juego, crea nuevas preguntas y controla la experiencia en tiempo real.
                                Selecciona una sala a la izquierda para comenzar.
                            </p>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { title: '1. Preparar', desc: 'Crea sala y preguntas', color: 'text-yellow-400', bg: 'bg-yellow-400/10', border: 'border-yellow-400/20' },
                            { title: '2. Activar', desc: 'Abre la sala a jugadores', color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
                            { title: '3. Jugar', desc: 'Controla el flujo', color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
                            { title: '4. Cerrar', desc: 'Finaliza y guarda', color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/20' }
                        ].map((item, i) => (
                            <div key={i} className={`p-6 rounded-2xl border ${item.border} ${item.bg} backdrop-blur-sm hover:scale-105 transition-transform duration-300 cursor-default`}>
                                <h3 className={`font-bold text-lg ${item.color} mb-2`}>{item.title}</h3>
                                <p className="text-sm text-slate-300/80 font-medium">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;
