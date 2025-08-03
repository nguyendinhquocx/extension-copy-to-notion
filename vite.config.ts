import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import path from 'path';

// Import manifest để tạo extension build
import manifest from './manifest.json' with { type: 'json' };

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    crx({ manifest })
  ],
  
  // Path resolution cho clean imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/popup/components'),
      '@/hooks': path.resolve(__dirname, './src/popup/hooks'),
      '@/shared': path.resolve(__dirname, './src/shared'),
      '@/utils': path.resolve(__dirname, './src/shared/utils'),
      '@/types': path.resolve(__dirname, './src/shared/types'),
      '@/constants': path.resolve(__dirname, './src/shared/constants')
    }
  },

  // Development server configuration
  server: {
    port: 3000,
    open: false, // Không auto-open browser cho extension development
    hmr: {
      port: 3001
    }
  },

  // Build configuration
  build: {
    rollupOptions: {
      output: {
        // Tách chunks cho optimal loading
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'notion-vendor': ['@notionhq/client']
        }
      }
    },
    // Extension cần sourcemap cho debugging
    sourcemap: true,
    // Optimize cho extension environment
    target: 'esnext',
    // Giảm bundle size warning threshold
    chunkSizeWarningLimit: 1000
  },

  // Define global constants
  define: {
    '__DEV__': process.env.NODE_ENV === 'development',
    '__VERSION__': JSON.stringify(process.env.npm_package_version)
  },

  // Test configuration với Vitest
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts']
  }
});
