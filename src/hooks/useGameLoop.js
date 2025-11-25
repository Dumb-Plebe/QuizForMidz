import { useState, useEffect } from 'react';
import { api } from '../services/api';

export const useGameLoop = (pin, isJoined) => {
    const [gameState, setGameState] = useState({
        status: 'lobby',
        players: {},
        music: false,
        current_question: null,
        player_status: {}
    });

    useEffect(() => {
        if (!pin || (isJoined === false)) return;

        const interval = setInterval(async () => {
            try {
                const data = await api.getStatus(pin);
                setGameState(prev => ({ ...prev, ...data }));
            } catch (e) {}
        }, 1000);

        return () => clearInterval(interval);
    }, [pin, isJoined]);

    return gameState;
};