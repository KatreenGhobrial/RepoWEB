import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './style.css'; // Make sure the global styles are loaded

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
