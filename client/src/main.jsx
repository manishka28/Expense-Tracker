import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from "./context/AuthContext";

import { ThemeProvider } from "./context/ThemeContext";
import { FetchProvider } from './context/FetchContext.jsx';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <FetchProvider>
    <App />
    </FetchProvider>
    </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>,
)
