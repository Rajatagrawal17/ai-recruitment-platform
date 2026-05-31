import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SavedJobsProvider } from './context/SavedJobsContext';

const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <ThemeProvider>
      <AuthProvider>
        <SavedJobsProvider>
          <App />
        </SavedJobsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}