// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import postcsspxtoviewport from 'postcss-px-to-viewport'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    css: {
        postcss: {
            plugins: [
                postcsspxtoviewport({
                    // 要转化的单位
                    unitToConvert: 'px',
                    // UI设计稿的大小
                    viewportWidth: 1500,
                    // 转换后的精度
                    unitPrecision: 6,
                    // 转换后的单位
                    viewportUnit: 'vw',
                    // 字体转换后的单位
                    // fontViewportUnit: 'vw',
                    // 能转换的属性，*表示所有属性，!border表示border不转
                    propList: ['*', '!font-size'],
                    // 指定不转换为视窗单位的类名，
                    // selectorBlackList: ['ignore-'],
                    // 最小转换的值，小于等于1不转
                    minPixelValue: 1,
                    // 是否在媒体查询的css代码中也进行转换，默认false
                    mediaQuery: false,
                    // 是否转换后直接更换属性值
                    replace: true,
                    // 忽略某些文件夹下的文件或特定文件，例如 'node_modules' 下的文件
                    // 包含那些文件或者特定文件
                    include: ['src/*'],
                    // 是否处理横屏情况
                    landscape: false,
                }),
            ],
        },
    },

    build: {
        minify: 'true',
        terserOptions: {
            compress: {
                //生产环境时移除console
                drop_console: true,
                drop_debugger: true,
            },
        },
    },
})
