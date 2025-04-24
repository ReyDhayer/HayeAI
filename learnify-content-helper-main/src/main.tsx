import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import { MaintenanceProvider } from './lib/context/MaintenanceContext'

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <MaintenanceProvider>
      <App />
    </MaintenanceProvider>
  </BrowserRouter>
);
