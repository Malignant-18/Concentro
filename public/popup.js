import { Welcome } from './components/Welcome/page.js';
import { Main } from './components/Main/page.js';
import { TabTrack } from './components/TabTrack/page.js';
import { Pomodoro } from './components/Pomodoro/page.js';
import { Whitelist } from './components/Whitelist/page.js';
import { Leaderboard } from './components/Leaderboard/page.js';

export function Link(to, text, className) {
    const link = document.createElement('button');
    link.textContent = text;
    link.className = className;
    link.addEventListener('click', (e) => {
        e.preventDefault();
        window.history.pushState({}, '', `#${to}`);
        navigate(to);
    });
    return link;
}

const routes = {
    '/': Welcome,
    '/main': Main,
    '/tab-track': TabTrack,
    '/pomodoro': Pomodoro,
    '/whitelist': Whitelist,
    '/leaderboard': Leaderboard
};

function navigate(path) {
    const component = routes[path] || routes['/'];
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.appendChild(component());
}

window.addEventListener('popstate', () => {
    navigate(window.location.hash.slice(1));
});

// Initial navigation to the welcome page
navigate('/');