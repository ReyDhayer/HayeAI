// This is an example - your actual router file might be different
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import MindMap from "./pages/MindMap";
// Add import for MonitorPrazos component
import MonitorPrazos from "./pages/MonitorPrazos";
// Remove the problematic import
// import "mind-elixir/dist/style.css";

// Add a context provider to share mind map format across components
import { createContext, useState } from "react";

// Create a context for mind map format
export const MindMapContext = createContext({
  format: "Crie um mapa mental sobre [assunto]. O mapa deve conter um tópico central, vários subtópicos e cada subnó deve ter pontos detalhados. Formate a resposta de maneira clara e hierárquica, usando listas para organização.",
  setFormat: (format: string) => {}
});

function App() {
  const [mindMapFormat, setMindMapFormat] = useState(
    "Crie um mapa mental sobre [assunto]. O mapa deve conter um tópico central, vários subtópicos e cada subnó deve ter pontos detalhados. Formate a resposta de maneira clara e hierárquica, usando listas para organização."
  );

  return (
    <MindMapContext.Provider value={{ format: mindMapFormat, setFormat: setMindMapFormat }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/mind-map" element={<MindMap />} />
          {/* Add the new route for monitor-prazos */}
          <Route path="/monitor-prazos" element={<MonitorPrazos />} />
          {/* Other routes */}
        </Routes>
      </BrowserRouter>
    </MindMapContext.Provider>
  );
}

export default App;
