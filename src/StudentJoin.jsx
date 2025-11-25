import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { useGameLoop } from './hooks/useGameLoop';
import { useAudio } from './hooks/useAudio';

export default function StudentJoin() {
    const [pin, setPin] = useState('');
    const [name, setName] = useState('');
    const [joined, setJoined] = useState(false);
    const [timeLeft, setTimeLeft] = useState(20);
    
    // --- 1. RESTORE SESSION (The Fix) ---
    useEffect(() => {
        const savedPin = sessionStorage.getItem('student_pin');
        const savedName = sessionStorage.getItem('student_name');
        if (savedPin && savedName) {
            setPin(savedPin);
            setName(savedName);
            setJoined(true);
        }
    }, []);

    const gameState = useGameLoop(pin, joined); 
    const { status, music, current_question } = gameState;
    const { playWin, playLose } = useAudio(music);

    const [shuffledOptions, setShuffledOptions] = useState([]);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [finalFeedback, setFinalFeedback] = useState(null);

    const handleJoin = async () => {
        if (pin.length !== 6 || !name) return alert("Enter PIN and Name");
        const res = await api.joinGame(pin, name);
        if (res.success) {
            setJoined(true);
            // --- 2. SAVE SESSION (The Fix) ---
            sessionStorage.setItem('student_pin', pin);
            sessionStorage.setItem('student_name', name);
        }
        else alert(res.message);
    };

    const submitAnswer = (isCorrect, isTimeout = false) => {
        if (finalFeedback) return;
        
        if (isTimeout) {
            setFinalFeedback('timeout');
            playLose();
            api.submitScore(pin, name, 0);
        } else if (isCorrect) {
            setFinalFeedback('correct'); 
            playWin(); 
            api.submitScore(pin, name, 100);
        } else {
            setFinalFeedback('wrong');
            playLose();
            api.submitScore(pin, name, 0);
        }
    };

    // --- EFFECTS ---
    useEffect(() => {
        if (!joined) return;
        const report = () => api.reportFocus(pin, name, document.hidden);
        document.addEventListener("visibilitychange", report);
        return () => document.removeEventListener("visibilitychange", report);
    }, [joined, pin, name]);

    useEffect(() => {
        if (current_question) {
            setHasSubmitted(false);
            setFinalFeedback(null);
            
            const mixed = [...current_question.options];
            for (let i = mixed.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
            }
            setShuffledOptions(mixed);
        }
    }, [current_question?.id]);

    useEffect(() => {
        if (!current_question || finalFeedback) return;
        const timer = setInterval(() => {
            const now = Date.now();
            const end = current_question.endTime || (now + 20000);
            const remaining = Math.ceil((end - now) / 1000);
            setTimeLeft(remaining > 0 ? remaining : 0);
            if (remaining <= 0) {
                clearInterval(timer);
                if (!hasSubmitted) submitAnswer(false, true);
            }
        }, 200);
        return () => clearInterval(timer);
    }, [current_question, finalFeedback, hasSubmitted]);

    // --- RENDER ---
    if (!joined) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
            <div className="bg-white/10 p-8 rounded-2xl w-full max-w-sm text-center border border-white/20">
                <h1 className="text-3xl font-black text-white mb-6">Join Quiz</h1>
                <input placeholder="Name" value={name} onChange={e=>setName(e.target.value)} className="w-full mb-4 p-4 rounded-xl bg-black/30 text-white text-center font-bold"/>
                <input placeholder="PIN" value={pin} onChange={e=>setPin(e.target.value)} className="w-full mb-4 p-4 rounded-xl bg-black/30 text-white text-center font-black tracking-widest" maxLength={6}/>
                <button onClick={handleJoin} className="w-full bg-blue-600 py-4 rounded-xl font-black text-white shadow-lg">ENTER</button>
            </div>
        </div>
    );

    if (status === 'lobby') return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
            <div className="text-6xl animate-bounce mb-4">⏳</div>
            <h2 className="text-2xl font-bold">You're In!</h2>
            <p className="opacity-50">Waiting for teacher...</p>
        </div>
    );

    if (current_question) {
        if (finalFeedback) {
            let bg = 'bg-slate-800'; let icon = '⏰'; let text = "TIME'S UP!";
            if (finalFeedback === 'correct') { bg = 'bg-green-600'; icon = '🦄'; text = 'NAILED IT!'; }
            if (finalFeedback === 'wrong')   { bg = 'bg-red-600';   icon = '💀'; text = 'NOPE'; }

            return (
                <div className={`min-h-screen flex flex-col items-center justify-center ${bg} text-white animate-in zoom-in`}>
                    <div className="text-8xl mb-4 animate-bounce">{icon}</div>
                    <h1 className="text-5xl font-black">{text}</h1>
                </div>
            );
        }

        return (
            <div className="min-h-screen flex flex-col bg-slate-900 p-4">
                <div className="w-full h-4 bg-gray-700 rounded-full mb-4 overflow-hidden">
                    <div className={`h-full transition-all duration-200 ${timeLeft < 5 ? 'bg-red-500' : 'bg-cyan-400'}`} style={{width: `${(timeLeft/20)*100}%`}}></div>
                </div>
                <div className="flex-grow flex items-center justify-center relative">
                     <h2 className="text-white text-2xl font-bold text-center">{current_question.text}</h2>
                     <div className="absolute opacity-10 text-[10rem] font-black pointer-events-none">{timeLeft}</div>
                </div>
                <div className="grid grid-cols-2 gap-4 h-1/2">
                    {shuffledOptions.map((opt, i) => (
                        <button key={i} onClick={() => { setHasSubmitted(true); submitAnswer(opt.is_correct); }} className="bg-indigo-600 hover:bg-indigo-500 rounded-2xl flex flex-col items-center justify-center p-4 shadow-xl active:scale-95 transition-transform border-b-4 border-indigo-800">
                            <span className="text-white font-bold text-xl leading-tight">{opt.answer}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return <div className="bg-slate-900 min-h-screen text-white p-10 text-center">Loading Question...</div>;
}