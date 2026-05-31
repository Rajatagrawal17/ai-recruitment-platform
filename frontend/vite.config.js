import { defineConfig, loadEnv, transformWithEsbuild } from 'vite';
import react from '@vitejs/plugin-react';
import { analyzer } from 'vite-bundle-analyzer';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      {
        name: 'treat-js-files-as-jsx',
        async transform(code, id) {
          if (!id.match(/src\/.*\.js$/)) return null;

          return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic',
          });
        },
      },
      react(),
      analyzer({
        analyzerMode: 'static',
        openAnalyzer: false,
        fileName: 'report.html',
      }),
    ],
    define: {
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
        REACT_APP_RECAPTCHA_SITE_KEY: JSON.stringify(env.REACT_APP_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'),
        REACT_APP_API_URL: JSON.stringify(env.REACT_APP_API_URL || 'https://cognifit-backend.onrender.com'),
      },
    },
    esbuild: {
      loader: 'jsx',
      include: /src\/.*\.jsx?$/,
      exclude: [],
    },
    optimizeDeps: {
      esbuildOptions: {
        loader: {
          '.js': 'jsx',
        },
      },
    },
    resolve: {
      alias: {
        'pdfjs-dist/build/pdf': '/src/utils/pdfjsMock.js',
        'pdfjs-dist/build/pdf.worker.entry': '/src/utils/pdfjsWorkerMock.js',
      }
    },
    build: {
      outDir: 'build',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            charts: ['recharts'],
            dnd: ['@dnd-kit/core'],
          },
        },
      },
    },
  };
});
