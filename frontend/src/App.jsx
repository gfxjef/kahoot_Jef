import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { GameProvider } from './context/GameContext';
import Login from './pages/Login';
import Home from './pages/Home';
import Lobby from './pages/Lobby';
import Game from './pages/Game';
import AdminDashboard from './pages/admin/AdminDashboard';
import QuestionManager from './pages/admin/QuestionManager';
import HostControl from './pages/admin/HostControl';
import HostDisplay from './pages/admin/HostDisplay';

import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <AuthProvider>
            <GameProvider>
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        {/* Protected Routes */}
                        <Route path="/" element={
                            <ProtectedRoute>
                                <Home />
                            </ProtectedRoute>
                        } />
                        <Route path="/lobby" element={
                            <ProtectedRoute>
                                <Lobby />
                            </ProtectedRoute>
                        } />
                        <Route path="/game" element={
                            <ProtectedRoute>
                                <Game />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin" element={
                            <ProtectedRoute requireAdmin={true}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/dashboard" element={
                            <ProtectedRoute requireAdmin={true}>
                                <AdminDashboard />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/manage/:gameId" element={
                            <ProtectedRoute requireAdmin={true}>
                                <QuestionManager />
                            </ProtectedRoute>
                        } />
                        <Route path="/admin/control/:pin" element={
                            <ProtectedRoute requireAdmin={true}>
                                <HostControl />
                            </ProtectedRoute>
                        } />

                        {/* Public Host Display (Projector View) - No Auth needed or maybe separate auth? 
                            For now, let's keep it open or require admin. Usually host display is opened by admin.
                            Let's require admin to be safe, or at least login.
                        */}
                        <Route path="/host/:pin" element={
                            <ProtectedRoute requireAdmin={true}>
                                <HostDisplay />
                            </ProtectedRoute>
                        } />
                    </Routes>
                </Router>
            </GameProvider>
        </AuthProvider>
    );
}

export default App;
