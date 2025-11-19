import React, { useState, useEffect } from 'react';

const API_URL = 'https://midn.cs.usna.edu/~m265454/QuizForMidz/api.php'; 

export default function TeacherLobby() {
    const [view, setView] = useState('upload'); // upload, lobby, game, results
    const [pin, setPin] = useState(null);
    const [players, setPlayers] = useState({}); // Object: { name: score }
    const [quizData, setQuizData] = useState(null);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [error, setError] = useState('');

    // --- 1. HANDLE FILE ---
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                if (typeof window.jsyaml === 'undefined') throw new Error("Library missing");
                const parsed = window.jsyaml.load(evt.target.result);
                if (!parsed || !parsed.questions) throw new Error("Missing 'questions' list");
                setQuizData(parsed);
                createGameSession();
            } catch (err) {
                alert(err.message);
            }
        };
        reader.readAsText(file);
    };

    // --- 2. API CALLS ---
    const createGameSession = async () => {
        const res = await fetch(`${API_URL}?action=create`);
        const data = await res.json();
        if (data.success) {
            setPin(data.pin);
            setView('lobby');
        }
    };

    const updateServerState = async (status, questionData = null) => {
        await fetch(`${API_URL}?action=update_game`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ pin, status, current_question: questionData })
        });
    };

    // --- 3. GAME LOGIC ---
    const startGame = () => {
        setCurrentQIndex(0);
        launchQuestion(0);
        setView('game');
    };

    const launchQuestion = (index) => {
        const q = quizData.questions[index];
        // Send question to students (including a timestamp ID to trigger their screen update)
        const payload = { ...q, id: Date.now() };
        updateServerState('active', payload);
    };

    const nextQuestion = () => {
        const nextIdx = currentQIndex + 1;
        if (nextIdx < quizData.questions.length) {
            setCurrentQIndex(nextIdx);
            launchQuestion(nextIdx);
        } else {
            updateServerState('finished', null);
            setView('results');
        }
    };

    // --- 4. POLLING (Keep player list updated) ---
    useEffect(() => {
        if (!pin) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_URL}?action=status&pin=${pin}`);
                const data = await res.json();
                if (data.players) setPlayers(data.players);
            } catch (e) {}
        }, 2000);
        return () => clearInterval(interval);
    }, [pin]);

    // --- RENDER ---
    if (view === 'upload') return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
             <div className="bg-white/10 p-12 rounded-[2rem] text-center border border-white/20">
                <h1 className="text-4xl font-black mb-8">Upload Quiz</h1>
                <input type="file" onChange={handleFileChange} className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:bg-cyan-500 file:text-white hover:file:bg-cyan-600"/>
             </div>
        </div>
    );

    if (view === 'lobby') return (
        <div className="min-h-screen flex flex-col items-center pt-20 bg-slate-900 text-white">
            <div className="text-center mb-12">
                <div className="text-pink-400 font-bold tracking-widest uppercase mb-2">Game PIN</div>
                <div className="text-8xl font-black">{pin}</div>
            </div>
            <div className="flex gap-4 flex-wrap justify-center mb-12">
                {Object.keys(players).map(p => (
                    <div key={p} className="bg-cyan-600 px-6 py-3 rounded-full font-bold animate-bounce">{p}</div>
                ))}
            </div>
            <button onClick={startGame} className="bg-white text-slate-900 px-16 py-6 rounded-full text-4xl font-black hover:scale-105 transition-transform">START GAME</button>
        </div>
    );

    if (view === 'game') {
        const q = quizData.questions[currentQIndex];
        return (
            <div className="min-h-screen flex flex-col bg-slate-900 text-white p-6">
                {/* HUD */}
                <div className="flex justify-between items-center mb-8">
                    <div className="text-xl font-bold text-cyan-400">Q: {currentQIndex + 1} / {quizData.questions.length}</div>
                    <button onClick={nextQuestion} className="bg-yellow-400 text-black px-8 py-3 rounded-full font-black shadow-lg hover:bg-yellow-300">
                        {currentQIndex + 1 === quizData.questions.length ? "FINISH GAME" : "NEXT QUESTION ➜"}
                    </button>
                </div>

                {/* Question Card */}
                <div className="bg-white/10 p-8 rounded-[2rem] text-center mb-8 border border-white/10">
                    {q.image_url && <img src={q.image_url} className="h-48 mx-auto rounded-xl mb-6 border-4 border-white/20"/>}
                    <h2 className="text-4xl font-black">{q.text}</h2>
                </div>

                {/* Live Leaderboard */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(players)
                        .sort(([,a], [,b]) => b - a) // Sort by score
                        .map(([name, score], i) => (
                        <div key={name} className="bg-black/30 p-4 rounded-xl flex justify-between items-center border border-white/10">
                            <span className="font-bold truncate">{i+1}. {name}</span>
                            <span className="text-yellow-400 font-black">{score}</span>
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
                {Object.entries(players)
                    .sort(([,a], [,b]) => b - a)
                    .map(([name, score], i) => (
                    <div key={name} className={`p-6 rounded-2xl flex justify-between items-center text-2xl font-bold ${i===0 ? 'bg-yellow-400 text-black scale-110 shadow-2xl' : 'bg-white/10'}`}>
                        <span>{i===0 ? '👑 ' : ''}{name}</span>
                        <span>{score}</span>
                    </div>
                ))}
            </div>
            <button onClick={() => window.location.reload()} className="mt-12 text-cyan-400 underline">New Game</button>
        </div>
    );
}