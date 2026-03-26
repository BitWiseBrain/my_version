import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';

// Inline global reset to avoid any external CSS
const style = document.createElement('style');
style.innerHTML = `
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
  a { text-decoration: none; color: inherit; }
`;
document.head.appendChild(style);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
