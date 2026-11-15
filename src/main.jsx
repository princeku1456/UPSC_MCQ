import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-toastify/dist/ReactToastify.css';
import './styles/styles.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { QuizSessionProvider } from './contexts/QuizSessionContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter future={{ v7_relativeSplatPath: true }}>
      <AuthProvider>
        <QuizSessionProvider>
          <App />
          <ToastContainer position="top-right" autoClose={3000} />
        </QuizSessionProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
