import { defineConfig } from 'vite';
import Vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [
    Vue({
      // https://vuejs.org/guide/extras/reactivity-transform.html
      reactivityTransform: true,
    }),
  ],
  server: {
    port: 1123,
  },
});
