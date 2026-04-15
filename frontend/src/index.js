import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SavedJobsProvider } from './context/SavedJobsContext';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<ThemeProvider>
		<AuthProvider>
			<SavedJobsProvider>
				<App />
			</SavedJobsProvider>
		</AuthProvider>
	</ThemeProvider>
);