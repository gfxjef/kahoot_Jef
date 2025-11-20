import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import Admin from './pages/Admin';

function App() {
    return (
        <GameProvider>
            <Router>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/lobby" element={<Lobby />} />
                    <Route path="/game" element={<Game />} />
                    <Route path="/admin" element={<Admin />} />
                </Routes>
            </Router>
        </GameProvider>
    );
}

export default App;
