// vite.config.ts
import { defineConfig } from "file:///C:/Users/Dhayer/Downloads/HayerMaster%20AI/learnify-content-helper-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Dhayer/Downloads/HayerMaster%20AI/learnify-content-helper-main/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/Users/Dhayer/Downloads/HayerMaster%20AI/learnify-content-helper-main/node_modules/lovable-tagger/dist/index.js";
import fs from "file:///C:/Users/Dhayer/Downloads/node_modules/fs-extra/lib/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Dhayer\\Downloads\\HayerMaster AI\\learnify-content-helper-main";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    historyApiFallback: true
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    }
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks: void 0
      }
    },
    // Ensure _redirects file is copied to dist folder during build
    emptyOutDir: true
  },
  // Copy _redirects file to dist folder after build
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    {
      name: "copy-redirects",
      closeBundle() {
        fs.writeFileSync(path.resolve(__vite_injected_original_dirname, "dist/_redirects"), "/* /index.html 200");
      }
    }
  ].filter(Boolean)
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxEaGF5ZXJcXFxcRG93bmxvYWRzXFxcXEhheWVyTWFzdGVyIEFJXFxcXGxlYXJuaWZ5LWNvbnRlbnQtaGVscGVyLW1haW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXERoYXllclxcXFxEb3dubG9hZHNcXFxcSGF5ZXJNYXN0ZXIgQUlcXFxcbGVhcm5pZnktY29udGVudC1oZWxwZXItbWFpblxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvRGhheWVyL0Rvd25sb2Fkcy9IYXllck1hc3RlciUyMEFJL2xlYXJuaWZ5LWNvbnRlbnQtaGVscGVyLW1haW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcclxuaW1wb3J0IGZzIGZyb20gJ2ZzLWV4dHJhJztcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZygoeyBtb2RlIH0pID0+ICh7XHJcbiAgc2VydmVyOiB7XHJcbiAgICBob3N0OiBcIjo6XCIsXHJcbiAgICBwb3J0OiA4MDgwLFxyXG4gICAgaGlzdG9yeUFwaUZhbGxiYWNrOiB0cnVlLFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiZcclxuICAgIGNvbXBvbmVudFRhZ2dlcigpLFxyXG4gIF0uZmlsdGVyKEJvb2xlYW4pLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxyXG4gICAgfSxcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICBvdXREaXI6ICdkaXN0JyxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB1bmRlZmluZWQsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgLy8gRW5zdXJlIF9yZWRpcmVjdHMgZmlsZSBpcyBjb3BpZWQgdG8gZGlzdCBmb2xkZXIgZHVyaW5nIGJ1aWxkXHJcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcclxuICB9LFxyXG4gIC8vIENvcHkgX3JlZGlyZWN0cyBmaWxlIHRvIGRpc3QgZm9sZGVyIGFmdGVyIGJ1aWxkXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiYgY29tcG9uZW50VGFnZ2VyKCksXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdjb3B5LXJlZGlyZWN0cycsXHJcbiAgICAgIGNsb3NlQnVuZGxlKCkge1xyXG4gICAgICAgIC8vIENyZWF0ZSBfcmVkaXJlY3RzIGZpbGUgaWYgaXQgZG9lc24ndCBleGlzdFxyXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ2Rpc3QvX3JlZGlyZWN0cycpLCAnLyogL2luZGV4Lmh0bWwgMjAwJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICBdLmZpbHRlcihCb29sZWFuKSxcclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStZLFNBQVMsb0JBQW9CO0FBQzVhLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFDaEMsT0FBTyxRQUFRO0FBSmYsSUFBTSxtQ0FBbUM7QUFPekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixvQkFBb0I7QUFBQSxFQUN0QjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFDVCxnQkFBZ0I7QUFBQSxFQUNsQixFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsYUFBYTtBQUFBLEVBQ2Y7QUFBQTtBQUFBLEVBRUEsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFBaUIsZ0JBQWdCO0FBQUEsSUFDMUM7QUFBQSxNQUNFLE1BQU07QUFBQSxNQUNOLGNBQWM7QUFFWixXQUFHLGNBQWMsS0FBSyxRQUFRLGtDQUFXLGlCQUFpQixHQUFHLG9CQUFvQjtBQUFBLE1BQ25GO0FBQUEsSUFDRjtBQUFBLEVBQ0YsRUFBRSxPQUFPLE9BQU87QUFDbEIsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
