import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import 'aos/dist/aos.css'; 
import AOS from 'aos';

AOS.init({
  duration: 1000, 
  once: false,
});

ReactDOM.render(<App />, document.getElementById('root')); 