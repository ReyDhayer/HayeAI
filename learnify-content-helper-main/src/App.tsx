import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MindMapPage from './pages/MindMap';
import MonitorPrazosPage from './pages/MonitorPrazos';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/mind-map" element={<MindMapPage />} />
        <Route path="/monitor-prazos" element={<MonitorPrazosPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
