import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { useGameLoop } from './hooks/useGameLoop';

export default function TeacherLobby() {
    const [view, setView] = useState('upload');
    const [pin, setPin] = useState(null);
    const [quizData, setQuizData] = useState(null);
    const [currentQIndex, setQIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(0);
    
    // --- 1. RESTORE SESSION ON LOAD (The Fix) ---
    useEffect(() => {
        const savedPin = sessionStorage.getItem('teacher_pin');
        const savedData = sessionStorage.getItem('teacher_data');
        if (savedPin && savedData) {
            setPin(savedPin);
            setQuizData(JSON.parse(savedData));
            // We don't manually set 'view' here. 
            // The useGameLoop hook below will connect to the server, 
            // see the status is 'lobby' or 'active', and update the UI automatically.
        }
    }, []);

    const { players, player_status, music, status: serverStatus } = useGameLoop(pin, true);

    // --- 2. SYNC VIEW WITH SERVER ---
    useEffect(() => {
        if (!pin) return;
        if (serverStatus === 'lobby') setView('lobby');
        if (serverStatus === 'active') setView('game');
        if (serverStatus === 'finished') setView('results');
    }, [serverStatus, pin]);

    const handleUpload = (e) => {
        const file = e.target.files[0];
        if(!file) return;
        const reader = new FileReader();
        reader.onload = async (evt) => {
            const parsed = window.jsyaml.load(evt.target.result);
            setQuizData(parsed);
            
            const res = await api.createGame();
            if(res.success) {
                setPin(res.pin);
                setView('lobby');
                
                // --- 3. SAVE SESSION (The Fix) ---
                sessionStorage.setItem('teacher_pin', res.pin);
                sessionStorage.setItem('teacher_data', JSON.stringify(parsed));
            }
        };
        reader.readAsText(file);
    };

    const toggleMusic = () => {
        api.updateGame(pin, null, null, !music);
    };

    const launchQuestion = (index) => {
        const q = quizData.questions[index];
        const payload = { ...q, id: Date.now(), endTime: Date.now() + 20000 };
        api.updateGame(pin, 'active', payload, music);
        
        setTimeLeft(20);
        const timer = setInterval(() => {
            setTimeLeft(p => {
                if(p <= 1) clearInterval(timer);
                return p - 1;
            });
        }, 1000);
    };

    const nextQuestion = () => {
        const nextIdx = currentQIndex + 1;
        if (nextIdx < quizData.questions.length) {
            setQIndex(nextIdx);
            launchQuestion(nextIdx);
        } else {
            api.updateGame(pin, 'finished', null, music);
            setView('results');
        }
    };

    const handleReset = () => {
        sessionStorage.clear();
        window.location.reload();
    };

    // --- RENDER ---
    const MusicButton = () => (
        <button onClick={toggleMusic} className={`fixed bottom-6 right-6 z-50 px-6 py-4 rounded-full font-black text-xl shadow-2xl transition-all border-4 border-white ${music ? 'bg-red-500 animate-pulse text-white' : 'bg-slate-700 text-gray-400'}`}>
            {music ? "🔊 MUSIC ON" : "🔇 MUSIC OFF"}
        </button>
    );

    if (view === 'upload') return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
             <div className="bg-white/10 p-12 rounded-[2rem] text-center border border-white/20">
                <h1 className="text-4xl font-black mb-8">Upload Quiz</h1>
                <input type="file" onChange={handleUpload} className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"/>
             </div>
        </div>
    );

    if (view === 'lobby') return (
        <div className="min-h-screen flex flex-col items-center pt-20 bg-slate-900 text-white">
            <MusicButton />
            <div className="text-center mb-12">
                <div className="text-pink-400 font-bold tracking-widest uppercase mb-2">Game PIN</div>
                <div className="text-8xl font-black">{pin}</div>
            </div>
            <div className="flex gap-4 flex-wrap justify-center mb-12 px-4">
                {players && Object.keys(players).map(p => (
                    <div key={p} className={`px-6 py-3 rounded-full font-bold shadow-xl border-2 transition-colors ${player_status && player_status[p] === 'tabbed_out' ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-cyan-600 border-white/20'}`}>
                        {p} {player_status && player_status[p] === 'tabbed_out' ? '⚠️' : ''}
                    </div>
                ))}
            </div>
            <button onClick={() => { launchQuestion(0); setView('game'); }} className="bg-white text-slate-900 px-16 py-6 rounded-full text-4xl font-black hover:scale-105 transition-transform">START GAME</button>
        </div>
    );

    if (view === 'game') {
        if (!quizData) return <div className="text-white text-center pt-20">Reloading Quiz Data...</div>;
        const q = quizData.questions[currentQIndex];
        return (
            <div className="min-h-screen flex flex-col bg-slate-900 text-white p-6">
                <MusicButton />
                <div className="flex justify-between items-center mb-8">
                    <div className="text-xl font-bold text-cyan-400">Q: {currentQIndex + 1} / {quizData.questions.length}</div>
                    <div className={`text-4xl font-black border-4 rounded-full w-20 h-20 flex items-center justify-center ${timeLeft < 5 ? 'border-red-500 text-red-500 animate-pulse' : 'border-white'}`}>{timeLeft}</div>
                    <button onClick={nextQuestion} className="bg-yellow-400 text-black px-8 py-3 rounded-full font-black shadow-lg hover:bg-yellow-300">
                        {currentQIndex + 1 === quizData.questions.length ? "FINISH GAME" : "NEXT QUESTION ➜"}
                    </button>
                </div>
                <div className="bg-white/10 p-8 rounded-[2rem] text-center mb-8 border border-white/10">
                    {q.image_url && <img src={q.image_url} className="h-48 mx-auto rounded-xl mb-6 border-4 border-white/20" alt="Quiz"/>}
                    <h2 className="text-4xl font-black">{q.text}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {players && Object.entries(players).sort(([,a], [,b]) => b - a).map(([name, score], i) => (
                        <div key={name} className={`p-4 rounded-xl flex justify-between items-center border-2 shadow-lg transition-colors ${player_status && player_status[name] === 'tabbed_out' ? 'bg-red-600 border-red-400' : 'bg-black/30 border-white/10'}`}>
                            <span className="font-bold truncate text-white">{i+1}. {name} {player_status && player_status[name] === 'tabbed_out' ? '⚠️' : ''}</span>
                            <span className="text-yellow-400 font-black ml-2">{score}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (view === 'results') return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
            <h1 className="text-6xl font-black text-yellow-400 mb-12">FINAL SCORES</h1>
            <div className="w-full max-w-2xl space-y-4">
                {players && Object.entries(players).sort(([,a], [,b]) => b - a).map(([name, score], i) => (
                    <div key={name} className={`p-6 rounded-2xl flex justify-between items-center text-2xl font-bold ${i===0 ? 'bg-yellow-400 text-black scale-110 shadow-2xl' : 'bg-white/10'}`}>
                        <span>{i===0 ? '👑 ' : ''}{name}</span>
                        <span>{score}</span>
                    </div>
                ))}
            </div>
            <button onClick={handleReset} className="mt-12 text-cyan-400 underline">New Game</button>
        </div>
    );
}