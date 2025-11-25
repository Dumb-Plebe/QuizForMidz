import { useRef, useEffect } from 'react';

const TRACKS = {
    bg: "https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/theme_01.mp3",
    win: "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3",
    lose: "https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3"
};

export const useAudio = (shouldPlayMusic) => {
    const bgRef = useRef(new Audio(TRACKS.bg));
    const winRef = useRef(new Audio(TRACKS.win));
    const loseRef = useRef(new Audio(TRACKS.lose));

    // Setup Loop
    useEffect(() => {
        bgRef.current.loop = true;
        bgRef.current.volume = 0.4;
    }, []);

    // React to Music Toggle
    useEffect(() => {
        if (shouldPlayMusic) {
            bgRef.current.play().catch(e => {});
        } else {
            bgRef.current.pause();
        }
    }, [shouldPlayMusic]);

    const playWin = () => {
        winRef.current.currentTime = 0;
        winRef.current.play().catch(e => {});
    };

    const playLose = () => {
        loseRef.current.currentTime = 0;
        loseRef.current.play().catch(e => {});
    };

    return { playWin, playLose };
};