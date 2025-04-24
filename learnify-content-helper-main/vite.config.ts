import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega as variáveis de ambiente do arquivo .env
  const env = loadEnv(mode, process.cwd(), '');

  // Converte as variáveis REACT_APP_ para VITE_
  const envWithReactApp = Object.keys(env).reduce((acc, key) => {
    if (key.startsWith('REACT_APP_')) {
      acc[`VITE_${key.slice(10)}`] = env[key];
    }
    return acc;
  }, {} as Record<string, string>);

  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      'process.env': {
        ...envWithReactApp,
        NODE_ENV: mode,
      },
    },
  };
});
