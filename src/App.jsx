import React, { useState } from 'react';
// 1. IMPORT YOUR NEW FILES
import TeacherLobby from './TeacherLobby';
import StudentJoin from './StudentJoin';

// If the original project had a main component, import it here.
// For this example, I'll assume we are replacing the view, 
// but if you want to keep the falling objects, you can wrap this whole thing in that layout.

function App() {
  // 2. CREATE A "STATE" TO TRACK WHICH PAGE WE ARE ON
  const [currentView, setCurrentView] = useState('home'); 

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
            {/* Back Button */}
            <button onClick={() => setCurrentView('home')} className="absolute top-4 left-4 text-sm opacity-50 hover:opacity-100">← Back</button>
            <TeacherLobby />
        </div>
      )}

      {/* --- VIEW 3: STUDENT JOIN --- */}
      {currentView === 'student' && (
        <div className="relative">
            {/* Back Button */}
            <button onClick={() => setCurrentView('home')} className="absolute top-4 left-4 text-sm opacity-50 hover:opacity-100">← Back</button>
            <StudentJoin />
        </div>
      )}

    </div>
  );
}

export default App;