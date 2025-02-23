import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'aos/dist/aos.css'; // Import AOS styles
import AOS from 'aos';

AOS.init({
  duration: 1000, // Animation duration
  once: false, // Whether animation should happen only once
});

ReactDOM.render(<App />, document.getElementById('root')); 