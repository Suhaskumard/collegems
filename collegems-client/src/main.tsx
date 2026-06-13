
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeProvider } from "./context/ThemeContext";
import { SocketProvider } from "./context/SocketContext";

createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <SocketProvider>
      <App />
    </SocketProvider>
  </ThemeProvider>,
)
