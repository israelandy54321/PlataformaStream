import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import '@livekit/components-styles'; // estilos base de LiveKit

createRoot(document.getElementById('root')).render(<App />);
