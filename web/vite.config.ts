import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { VitePWA } from 'vite-plugin-pwa';
// @ts-ignore
import fs from 'fs';

// if in ESM context
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        // https: {
        //     cert: fs.readFileSync('D:/Edgedownload/localhost.pem'),
        //     key: fs.readFileSync('D:/Edgedownload/localhost-key.pem')
        // },
        host: '0.0.0.0' // 监听所有网络接口
        /* proxy: {
            '/api': {
                target: 'http://127.0.0.1:9900',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api/, '')
            }
        } */
    },
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            manifest: {
                name: 'zyxpwa',
                short_name: 'zyxpwa',
                display: 'standalone',
                description: 'ZYX Web App',
                theme_color: '#ffffff'
            }
        })
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src')
        }
    },
    css: {
        // 预处理器配置项
        preprocessorOptions: {
            less: {
                math: 'always'
            }
        }
    }
});
