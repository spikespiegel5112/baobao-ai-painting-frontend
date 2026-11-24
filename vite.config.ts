import { defineConfig } from 'vite';
import path from 'path';
import vue from '@vitejs/plugin-vue';
import { loadEnv } from 'vite';
import type { ProxyOptions } from 'vite';
import AutoImport from 'unplugin-auto-import/vite';
import ViteComponents from 'unplugin-vue-components/vite';
// 使用你所使用的UI组件库的 resolver
import { ElementPlusResolver, AntDesignVueResolver } from 'unplugin-vue-components/resolvers';
import requireTransform from 'vite-plugin-require-transform';

const pathSrc = path.resolve(__dirname, 'src');

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxy = {
    '/chatsdapi': {
      target: env.VITE_BASE_URL,
      changeOrigin: true,
      rewrite: (path: string) => path.replace('/chatsdapi', '/'),
      configure(proxy: Parameters<NonNullable<ProxyOptions['configure']>>[0]) {
        proxy.on('proxyReq', (proxyReq, req) => {
          console.log('[Proxy Request]', req.url, '=>', proxyReq.path);
        });

        proxy.on('proxyRes', (proxyRes) => {
          // 将后端的 CORS 响应头改为主应用的开发 Origin
          proxyRes.headers['access-control-allow-origin'] = 'http://localhost:5173';

          proxyRes.headers['access-control-allow-credentials'] = 'true';
        });

        proxy.on('error', (error) => {
          console.error('[Proxy Error]', error);
        });
      },
    },
  };

  return {
    base: './',
    resolve: {
      alias: {
        '~/': `${pathSrc}/`,
        '@/': `${pathSrc}/`,
      },
    },
    css: {
      preprocessorOptions: {
        scss: {},
      },
    },
    plugins: [
      vue(),
      AutoImport({
        imports: ['vue', 'vuex', 'vue-router'],
        dts: 'src/auto-import.d.ts',
        resolvers: [ElementPlusResolver()],
      }),
      ViteComponents({
        resolvers: [
          ElementPlusResolver(),
          AntDesignVueResolver({
            importStyle: false, // css in js
          }),
        ],
        dts: 'src/components.d.ts',
      }),
      requireTransform(),
    ],
    define: {
      'process.env': {},
      __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: 'false',
    },
    server: {
      proxy: apiProxy,
    },
  };
});
