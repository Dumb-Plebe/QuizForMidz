import React, { useState, useEffect, useRef } from 'react';

const API_URL = 'https://midn.cs.usna.edu/~m265454/QuizForMidz/api.php'; 
const BG_MUSIC_URL = "https://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/theme_01.mp3";
const WIN_SFX = "https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3";
const LOSE_SFX = "https://assets.mixkit.co/active_storage/sfx/2018/2018-preview.mp3";

export default function StudentJoin() {
    const [pin, setPin] = useState('');
    const [name, setName] = useState('');
    const [joined, setJoined] = useState(false);
    const [gameStatus, setGameStatus] = useState('lobby'); 
    const [currentQ, setCurrentQ] = useState(null);
    const [timeLeft, setTimeLeft] = useState(20);
    const [shuffledOptions, setShuffledOptions] = useState([]);

    // --- NEW STATES FOR DELAYED REVEAL ---
    const [hasSubmitted, setHasSubmitted] = useState(false); // Controls "Locked In" screen
    const [pendingResult, setPendingResult] = useState(null); // Stores 'correct' or 'wrong' secretly
    const [finalFeedback, setFinalFeedback] = useState(null); // What actually shows at the end

    // --- AUDIO REFS ---
    const bgMusicRef = useRef(new Audio(BG_MUSIC_URL));
    const winRef = useRef(new Audio(WIN_SFX));
    const loseRef = useRef(new Audio(LOSE_SFX));

    const handleJoin = async () => {
        if (pin.length !== 6 || !name) return alert("Enter PIN and Name");
        const res = await fetch(`${API_URL}?action=join`, {
            method: 'POST',
            body: JSON.stringify({ pin, name })
        });
        const data = await res.json();
        if (data.success) {
            setJoined(true);
            // Preload all audio
            bgMusicRef.current.loop = true;
            bgMusicRef.current.volume = 0.4;
            bgMusicRef.current.load();
            winRef.current.volume = 1.0;
            loseRef.current.volume = 1.0;
        } else alert(data.message);
    };

    // --- ANTI-CHEAT (Tab Out) ---
    useEffect(() => {
        if (!joined) return;
        const reportFocus = async () => {
            await fetch(`${API_URL}?action=focus`, {
                method: 'POST',
                body: JSON.stringify({ pin, name, is_tabbed_out: document.hidden })
            });
        };
        document.addEventListener("visibilitychange", reportFocus);
        return () => document.removeEventListener("visibilitychange", reportFocus);
    }, [joined, pin, name]);

    // --- POLL LOOP ---
    useEffect(() => {
        if (!joined) return;
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`${API_URL}?action=status&pin=${pin}`);
                const data = await res.json();
                
                setGameStatus(data.status);

                // Music Control
                if (data.music === true) {
                    if (bgMusicRef.current.paused) bgMusicRef.current.play().catch(e => {});
                } else {
                    if (!bgMusicRef.current.paused) bgMusicRef.current.pause();
                }

                // New Question Detection
                if (data.current_question && data.current_question.id !== currentQ?.id) {
                    setCurrentQ(data.current_question);
                    // RESET EVERYTHING FOR NEW ROUND
                    setHasSubmitted(false);
                    setPendingResult(null);
                    setFinalFeedback(null);
                    updateTimer(data.current_question.endTime);
                }
            } catch (e) {}
        }, 1000); 
        return () => clearInterval(interval);
    }, [joined, pin, currentQ]);

    // --- SHUFFLE OPTIONS ---
    useEffect(() => {
        if (currentQ && currentQ.options) {
            const mixed = [...currentQ.options];
            for (let i = mixed.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [mixed[i], mixed[j]] = [mixed[j], mixed[i]];
            }
            setShuffledOptions(mixed);
        }
    }, [currentQ]);

    // --- TIMER & REVEAL LOGIC ---
    useEffect(() => {
        if (!currentQ || finalFeedback) return; 

        const timerInterval = setInterval(() => {
            const now = Date.now();
            const end = currentQ.endTime || (now + 20000); 
            const secondsRemaining = Math.ceil((end - now) / 1000);
            setTimeLeft(secondsRemaining);

            // === THE MOMENT OF TRUTH ===
            if (secondsRemaining <= 0) {
                clearInterval(timerInterval);
                
                // 1. If user never submitted, force a timeout
                if (!hasSubmitted) {
                    submitAnswer(false, true); 
                } 
                // 2. If user DID submit, reveal the result now
                else {
                    revealResult();
                }
            }
        }, 200); 
        return () => clearInterval(timerInterval);
    }, [currentQ, finalFeedback, hasSubmitted, pendingResult]);

    const updateTimer = (endTime) => {
        const remaining = Math.ceil((endTime - Date.now()) / 1000);
        setTimeLeft(remaining > 0 ? remaining : 0);
    };

    // --- LOGIC: USER CLICKS BUTTON ---
    const handleOptionClick = (isCorrect) => {
        if (hasSubmitted || finalFeedback) return; // Prevent double clicks
        
        // 1. Lock UI immediately
        setHasSubmitted(true);
        
        // 2. Store result secretly
        const result = isCorrect ? 'correct' : 'wrong';
        setPendingResult(result);

        // 3. Send score to server (Server adds points, but we don't show user yet)
        if (isCorrect) {
             fetch(`${API_URL}?action=score`, {
                method: 'POST',
                body: JSON.stringify({ pin, name, points: 100 })
            });
        } else {
             fetch(`${API_URL}?action=score`, {
                method: 'POST',
                body: JSON.stringify({ pin, name, points: 0 })
            });
        }
    };

    // --- LOGIC: TIMER HITS ZERO (Reveal) ---
    const revealResult = () => {
        // Stop background music for dramatic effect (Optional)
        // bgMusicRef.current.pause();

        if (pendingResult === 'correct') {
            setFinalFeedback('correct');
            winRef.current.currentTime = 0;
            winRef.current.play();
        } else {
            setFinalFeedback('wrong');
            loseRef.current.currentTime = 0;
            loseRef.current.play();
        }
    };

    // --- LOGIC: FORCED TIMEOUT (User did nothing) ---
    const submitAnswer = async (isCorrect, isTimeout = false) => {
        if (finalFeedback) return; 

        if (isTimeout) {
            setFinalFeedback('timeout'); 
            loseRef.current.currentTime = 0;
            loseRef.current.play();
            
            await fetch(`${API_URL}?action=score`, {
                method: 'POST',
                body: JSON.stringify({ pin, name, points: 0 })
            });
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
        
        // 1. SHOW RESULT (Only after timer hits 0)
        if (finalFeedback) {
            let bg = 'bg-slate-800';
            let icon = '⏰';
            let text = "TIME'S UP!";
            
            if (finalFeedback === 'correct') { bg = 'bg-green-600'; icon = '🦄'; text = 'NAILED IT!'; }
            if (finalFeedback === 'wrong')   { bg = 'bg-red-600';   icon = '💀'; text = 'NOPE'; }

            return (
                <div className={`min-h-screen flex flex-col items-center justify-center ${bg} text-white animate-in zoom-in duration-300`}>
                    <div className="text-8xl mb-4 animate-bounce">{icon}</div>
                    <h1 className="text-5xl font-black">{text}</h1>
                    <p className="mt-4 font-bold">Wait for next question...</p>
                </div>
            );
        }

        // 2. SHOW "LOCKED IN" (User clicked, waiting for timer)
        if (hasSubmitted) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-indigo-900 text-white">
                    <div className="text-8xl mb-4 animate-pulse">🔒</div>
                    <h1 className="text-4xl font-black text-center">Answer Locked In</h1>
                    <p className="mt-4 text-xl opacity-70">Waiting for time to run out...</p>
                    <div className="mt-8 text-4xl font-mono">{timeLeft}s</div>
                </div>
            );
        }

        // 3. SHOW QUESTIONS (Normal State)
        return (
            <div className="min-h-screen flex flex-col bg-slate-900 p-4">
                <div className="w-full h-4 bg-gray-700 rounded-full mb-4 overflow-hidden">
                    <div className={`h-full transition-all duration-200 ${timeLeft < 5 ? 'bg-red-500' : 'bg-cyan-400'}`} style={{width: `${(timeLeft/20)*100}%`}}></div>
                </div>

                <div className="flex-grow flex items-center justify-center relative">
                     <h2 className="text-white text-2xl font-bold text-center">{currentQ.text}</h2>
                     <div className="absolute opacity-10 text-[10rem] font-black pointer-events-none">{timeLeft}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 h-1/2">
                    {shuffledOptions.map((opt, i) => (
                        <button 
                            key={i} 
                            onClick={() => handleOptionClick(opt.is_correct)}
                            className="bg-indigo-600 hover:bg-indigo-500 rounded-2xl flex flex-col items-center justify-center p-4 shadow-xl active:scale-95 transition-transform border-b-4 border-indigo-800"
                        >
                            <span className="text-white font-bold text-xl leading-tight">{opt.answer}</span>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    return <div className="bg-slate-900 min-h-screen text-white p-10 text-center">Loading Question...</div>;
}