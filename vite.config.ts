import path from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import dts from 'vite-plugin-dts'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    dts({
      include: './src/lib/**',
      outDir: './dist/dts'
    })
  ],
  build:{
    target: 'es2015',
    cssTarget: 'chrome61',
    minify: true,
    lib: {
      entry: path.resolve(__dirname, './src/lib/index.ts'),
      name: 'vue2.7-dragger',
      fileName: 'vue2.7-dragger',
      formats: ['cjs', 'es'],
    },
    outDir: './dist/lib',
    sourcemap: true,
    emptyOutDir: true,
    rollupOptions: {
      external: ['vue'],
    
      output: {
        // 在 UMD 构建模式下为这些外部化的依赖提供一个全局变量
        globals: {
          vue: 'Vue',
        },
      },
    }
  }
})
