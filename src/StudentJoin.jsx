import React, { useState, useEffect } from 'react';

const API_URL = 'https://midn.cs.usna.edu/~m265454/QuizForMidz/api.php'; 

export default function StudentJoin() {
    const [pin, setPin] = useState('');
    const [name, setName] = useState('');
    const [joined, setJoined] = useState(false);
    const [gameStatus, setGameStatus] = useState('lobby'); // lobby, active, finished
    const [currentQ, setCurrentQ] = useState(null);
    const [lastAnsweredId, setLastAnsweredId] = useState(0); // To prevent double answering
    const [feedback, setFeedback] = useState(null); // 'correct' or 'wrong'

    // --- JOIN LOGIC ---
    const handleJoin = async () => {
        if (pin.length !== 6 || !name) return alert("Enter PIN and Name");
        const res = await fetch(`${API_URL}?action=join`, {
            method: 'POST',
            body: JSON.stringify({ pin, name })
        });
        const data = await res.json();
        if (data.success) setJoined(true);
        else alert(data.message);
    };

    // --- POLL GAME STATE ---
    useEffect(() => {
        if (!joined) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_URL}?action=status&pin=${pin}`);
                const data = await res.json();
                
                setGameStatus(data.status);

                // Check for NEW question
                if (data.current_question && data.current_question.id !== currentQ?.id) {
                    setCurrentQ(data.current_question);
                    setFeedback(null); // Reset screen for new question
                }
            } catch (e) {}
        }, 1000); // Check every 1 second for speed
        return () => clearInterval(interval);
    }, [joined, pin, currentQ]);

    // --- HANDLE ANSWER ---
    const submitAnswer = async (isCorrect) => {
        if (feedback) return; // Already answered

        if (isCorrect) {
            setFeedback('correct');
            // Send points to server
            await fetch(`${API_URL}?action=score`, {
                method: 'POST',
                body: JSON.stringify({ pin, name, points: 100 })
            });
        } else {
            setFeedback('wrong');
        }
    };

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

    if (gameStatus === 'lobby') return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
            <div className="text-6xl animate-bounce mb-4">⏳</div>
            <h2 className="text-2xl font-bold">You're In!</h2>
            <p className="opacity-50">Waiting for teacher...</p>
        </div>
    );

    if (gameStatus === 'finished') return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
            <h1 className="text-4xl font-black">GAME OVER</h1>
            <p>Check the main screen for results!</p>
        </div>
    );

    // --- GAME ACTIVE ---
    if (currentQ) {
        // Feedback Screen (Correct/Wrong)
        if (feedback) return (
            <div className={`min-h-screen flex flex-col items-center justify-center ${feedback==='correct'?'bg-green-600':'bg-red-600'} text-white`}>
                <div className="text-8xl mb-4">{feedback==='correct' ? '🦄' : '💀'}</div>
                <h1 className="text-5xl font-black">{feedback==='correct' ? 'NAILED IT!' : 'NOPE'}</h1>
                <p className="mt-4 font-bold">Wait for next question...</p>
            </div>
        );

        // Buttons Screen
        const colors = ['bg-red-500', 'bg-blue-500', 'bg-yellow-500', 'bg-green-500'];
        const shapes = ['▲', '◆', '●', '■'];

        return (
            <div className="min-h-screen flex flex-col bg-slate-900 p-4">
                <div className="flex-grow flex items-center justify-center">
                     <h2 className="text-white text-2xl font-bold text-center">{currentQ.text}</h2>
                </div>
                <div className="grid grid-cols-2 gap-4 h-1/2">
                    {currentQ.options.map((opt, i) => (
                        <button 
                            key={i} 
                            onClick={() => submitAnswer(opt.is_correct)}
                            className={`${colors[i%4]} rounded-2xl flex flex-col items-center justify-center p-4 shadow-xl active:scale-95 transition-transform`}
                        >
                            <span className="text-4xl text-black/20 font-black mb-2">{shapes[i%4]}</span>
                            <span className="text-white font-bold text-xl leading-tight">{opt.answer}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return <div className="bg-slate-900 min-h-screen text-white p-10 text-center">Loading Question...</div>;
}