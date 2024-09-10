import globals from 'globals';
import pluginJs from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';


export default [
  {files: ['**/*.{js,mjs,cjs,vue}']},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    rules: {
      // 'vue/multi-word-component-names': 'error',
      // 'vue/no-arrow-functions-in-watch': 'error',
      // 'vue/no-async-in-computed-properties': 'error',
      // 'vue/no-child-content': 'error',
      // 'vue/no-computed-properties-in-data': 'error',
      // 'vue/no-deprecated-data-object-declaration': 'error',
      // 'vue/no-deprecated-destroyed-lifecycle': 'error',
    }
  }
];