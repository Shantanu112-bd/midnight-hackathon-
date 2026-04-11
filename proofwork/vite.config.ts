import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import wasm from "vite-plugin-wasm";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    wasm(),
    topLevelAwait(),
    // Copy WASM and ZK keys to output
    viteStaticCopy({
      targets: [
        {
          src: '../managed/contract/*.wasm',
          dest: 'keys'
        },
        {
          src: '../managed/keys/*.prover', 
          dest: 'keys'
        },
        {
          src: '../managed/keys/*.verifier',
          dest: 'keys'
        },
        {
          src: '../managed/zkir/*.zkir',
          dest: 'keys'
        }
      ]
    })
  ],
  // Required for WASM and CommonJS interoperability
  optimizeDeps: {
    include: [
      'object-inspect',
      'effect',
      '@effect/platform',
      '@effect/platform-browser'
    ],
    exclude: [
      '@midnight-ntwrk/compact-runtime',
      '@midnight-ntwrk/midnight-js',
      '@midnight-ntwrk/ledger-wasm',
      '@midnight-ntwrk/platform-js'
    ]
  },
  server: {
    headers: {
      // Required for WASM SharedArrayBuffer
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    port: 5176,
    fs: {
      allow: ['..']
    },
    proxy: {
      '/prove': {
        target: 'http://localhost:6300',
        changeOrigin: true,
      },
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    },
  },
  build: {
    target: 'esnext', // Required for WASM top-level await
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  }
})
