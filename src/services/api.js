const BASE_URL = 'https://midn.cs.usna.edu/~m265454/QuizForMidz/api.php';

const apiRequest = async (action, body = null) => {
    try {
        const options = body ? {
            method: 'POST',
            body: JSON.stringify(body)
        } : { method: 'GET' };

        // For GET requests, append params to URL
        const url = body ? `${BASE_URL}?action=${action}` : `${BASE_URL}?action=${action}&pin=${body?.pin || ''}`;
        
        const res = await fetch(url, options);
        return await res.json();
    } catch (e) {
        console.error("API Error:", e);
        return { success: false, message: "Network Error" };
    }
};

export const api = {
    createGame: () => apiRequest('create'),
    joinGame: (pin, name) => apiRequest('join', { pin, name }),
    updateGame: (pin, status, question, music) => apiRequest('update_game', { pin, status, current_question: question, music }),
    submitScore: (pin, name, points) => apiRequest('score', { pin, name, points }),
    reportFocus: (pin, name, isTabbedOut) => apiRequest('focus', { pin, name, is_tabbed_out: isTabbedOut }),
    getStatus: (pin) => fetch(`${BASE_URL}?action=status&pin=${pin}`).then(r => r.json())
};