
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from "./context/ThemeContext";
import { SocketProvider } from "./context/SocketContext";

import { ToastProvider } from "./context/ToastContext";

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <ToastProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </ToastProvider>
  </ThemeProvider>,
)
