// vite.config.ts
import { defineConfig } from "file:///C:/Users/Dhayer/Downloads/HayerMaster%20AI/learnify-content-helper-main/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/Dhayer/Downloads/HayerMaster%20AI/learnify-content-helper-main/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///C:/Users/Dhayer/Downloads/HayerMaster%20AI/learnify-content-helper-main/node_modules/lovable-tagger/dist/index.js";
import * as fs from "file:///C:/Users/Dhayer/Downloads/node_modules/fs-extra/lib/index.js";
var __vite_injected_original_dirname = "C:\\Users\\Dhayer\\Downloads\\HayerMaster AI\\learnify-content-helper-main";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    historyApiFallback: true
  },
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxEaGF5ZXJcXFxcRG93bmxvYWRzXFxcXEhheWVyTWFzdGVyIEFJXFxcXGxlYXJuaWZ5LWNvbnRlbnQtaGVscGVyLW1haW5cIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXERoYXllclxcXFxEb3dubG9hZHNcXFxcSGF5ZXJNYXN0ZXIgQUlcXFxcbGVhcm5pZnktY29udGVudC1oZWxwZXItbWFpblxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvRGhheWVyL0Rvd25sb2Fkcy9IYXllck1hc3RlciUyMEFJL2xlYXJuaWZ5LWNvbnRlbnQtaGVscGVyLW1haW4vdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xyXG5pbXBvcnQgcGF0aCBmcm9tIFwicGF0aFwiO1xyXG5pbXBvcnQgeyBjb21wb25lbnRUYWdnZXIgfSBmcm9tIFwibG92YWJsZS10YWdnZXJcIjtcclxuaW1wb3J0ICogYXMgZnMgZnJvbSAnZnMtZXh0cmEnO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgICBoaXN0b3J5QXBpRmFsbGJhY2s6IHRydWUsXHJcbiAgfSxcclxuXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIG91dERpcjogJ2Rpc3QnLFxyXG4gICAgcm9sbHVwT3B0aW9uczoge1xyXG4gICAgICBvdXRwdXQ6IHtcclxuICAgICAgICBtYW51YWxDaHVua3M6IHVuZGVmaW5lZCxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICAvLyBFbnN1cmUgX3JlZGlyZWN0cyBmaWxlIGlzIGNvcGllZCB0byBkaXN0IGZvbGRlciBkdXJpbmcgYnVpbGRcclxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxyXG4gIH0sXHJcbiAgcGx1Z2luczogW1xyXG4gICAgcmVhY3QoKSxcclxuICAgIG1vZGUgPT09ICdkZXZlbG9wbWVudCcgJiYgY29tcG9uZW50VGFnZ2VyKCksXHJcbiAgICB7XHJcbiAgICAgIG5hbWU6ICdjb3B5LXJlZGlyZWN0cycsXHJcbiAgICAgIGNsb3NlQnVuZGxlKCkge1xyXG4gICAgICAgIC8vIENyZWF0ZSBfcmVkaXJlY3RzIGZpbGUgaWYgaXQgZG9lc24ndCBleGlzdFxyXG4gICAgICAgIGZzLndyaXRlRmlsZVN5bmMocGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ2Rpc3QvX3JlZGlyZWN0cycpLCAnLyogL2luZGV4Lmh0bWwgMjAwJyk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICBdLmZpbHRlcihCb29sZWFuKSxcclxufSkpO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQStZLFNBQVMsb0JBQW9CO0FBQzVhLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFDaEMsWUFBWSxRQUFRO0FBSnBCLElBQU0sbUNBQW1DO0FBT3pDLElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxPQUFPO0FBQUEsRUFDekMsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sb0JBQW9CO0FBQUEsRUFDdEI7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQSxJQUNMLFFBQVE7QUFBQSxJQUNSLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQSxNQUNoQjtBQUFBLElBQ0Y7QUFBQTtBQUFBLElBRUEsYUFBYTtBQUFBLEVBQ2Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLFNBQVMsaUJBQWlCLGdCQUFnQjtBQUFBLElBQzFDO0FBQUEsTUFDRSxNQUFNO0FBQUEsTUFDTixjQUFjO0FBRVosUUFBRyxpQkFBYyxLQUFLLFFBQVEsa0NBQVcsaUJBQWlCLEdBQUcsb0JBQW9CO0FBQUEsTUFDbkY7QUFBQSxJQUNGO0FBQUEsRUFDRixFQUFFLE9BQU8sT0FBTztBQUNsQixFQUFFOyIsCiAgIm5hbWVzIjogW10KfQo=
