import { defineConfig } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      'three/addons/': path.resolve(__dirname, 'dist/vendor/') + '/'
    }
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    target: 'esnext',
    lib: {
      entry: path.resolve(__dirname, 'src/main.js'),
      name: 'Skelet',
      fileName: () => 'app.js',
      formats: ['es']
    },
    rollupOptions: {
      external: [
        'three',
        'three/addons/OrbitControls.js',
        'three/addons/GLTFLoader.js',
        'three/addons/meshopt_decoder.module.js'
      ],
      output: {
        paths: {
          'three': 'three',
          'three/addons/OrbitControls.js': './vendor/OrbitControls.js',
          'three/addons/GLTFLoader.js': './vendor/GLTFLoader.js',
          'three/addons/meshopt_decoder.module.js': './vendor/meshopt_decoder.module.js'
        }
      }
    }
  },
  test: {
    environment: 'node',
    globals: true
  }
});
