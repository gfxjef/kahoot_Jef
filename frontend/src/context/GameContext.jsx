import React, { createContext, useState, useEffect } from 'react';
import { socket } from '../services/socket';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
    const [gameState, setGameState] = useState(() => {
        const savedState = localStorage.getItem('gameState');
        return savedState ? JSON.parse(savedState) : {
            isConnected: false,
            gameId: null,
            playerId: null,
            nickname: '',
            pin: null,
            currentQuestion: null,
            score: 0,
            isGameStarted: false,
            isGameOver: false
        };
    });

    useEffect(() => {
        console.log("GameContext State Updated:", gameState);
        localStorage.setItem('gameState', JSON.stringify(gameState));
    }, [gameState]);

    useEffect(() => {
        socket.on('connect', () => {
            setGameState(prev => ({ ...prev, isConnected: true }));
        });

        socket.on('disconnect', () => {
            setGameState(prev => ({ ...prev, isConnected: false }));
        });

        socket.on('player_joined', (data) => {
            console.log('Player joined:', data);
        });

        socket.on('game_started', () => {
            setGameState(prev => ({ ...prev, isGameStarted: true }));
        });

        socket.on('new_question', (question) => {
            setGameState(prev => ({ ...prev, currentQuestion: question }));
        });

        socket.on('answer_result', (data) => {
            setGameState(prev => ({ ...prev, score: data.score }));
        });

        socket.on('game_over', () => {
            setGameState(prev => ({ ...prev, isGameOver: true }));
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('player_joined');
            socket.off('game_started');
            socket.off('new_question');
            socket.off('game_over');
        };
    }, []);

    return (
        <GameContext.Provider value={{ gameState, setGameState, socket }}>
            {children}
        </GameContext.Provider>
    );
};
