import React, { useState } from 'react'; // Removed useEffect
import TeacherLobby from './TeacherLobby';
import StudentJoin from './StudentJoin';

export default function App() {
  // --- 1. CHECK STORAGE IMMEDIATELY (The Fix) ---
  // By putting a function inside useState, it runs BEFORE the screen draws.
  const [currentView, setCurrentView] = useState(() => {
    const teacherPin = sessionStorage.getItem('teacher_pin');
    const studentPin = sessionStorage.getItem('student_pin');

    if (teacherPin) return 'teacher';
    if (studentPin) return 'student';
    return 'home';
  });

  // --- LOGOUT HELPER ---
  const handleLogout = () => {
    if(window.confirm("Are you sure you want to exit?")) {
        sessionStorage.clear(); 
        setCurrentView('home');
        window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      
      {/* --- VIEW 1: HOME SCREEN --- */}
      {currentView === 'home' && (
        <div className="flex flex-col items-center justify-center h-screen text-center p-4">
          <h1 className="text-6xl font-black mb-8 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-cyan-500">
            QuizForMidz
          </h1>
          <div className="flex gap-6">
            <button 
              onClick={() => setCurrentView('teacher')}
              className="px-8 py-4 bg-purple-600 hover:bg-purple-500 rounded-2xl text-2xl font-bold shadow-lg transition-all hover:scale-105"
            >
              Teacher Host
            </button>
            <button 
              onClick={() => setCurrentView('student')}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-2xl font-bold shadow-lg transition-all hover:scale-105"
            >
              Student Join
            </button>
          </div>
        </div>
      )}

      {/* --- VIEW 2: TEACHER LOBBY --- */}
      {currentView === 'teacher' && (
        <div className="relative">
            <button 
                onClick={handleLogout} 
                className="fixed top-4 left-4 z-[100] bg-red-500/20 hover:bg-red-500/50 text-white px-4 py-2 rounded-lg font-bold text-sm backdrop-blur-sm border border-red-500/30"
            >
                ← Exit Game
            </button>
            <TeacherLobby />
        </div>
      )}

      {/* --- VIEW 3: STUDENT JOIN --- */}
      {currentView === 'student' && (
        <div className="relative">
             <button 
                onClick={handleLogout} 
                className="fixed top-4 left-4 z-[100] bg-red-500/20 hover:bg-red-500/50 text-white px-4 py-2 rounded-lg font-bold text-sm backdrop-blur-sm border border-red-500/30"
            >
                ← Leave
            </button>
            <StudentJoin />
        </div>
      )}

    </div>
  );
}