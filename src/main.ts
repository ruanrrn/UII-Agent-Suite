// src/main.ts
import { createApp } from 'vue';
import App from './App.vue';
import { router } from './router';
import { i18n } from './i18n';
import { createDataSource } from './services';
import './styles/tokens.css';
import './styles/base.css';
import './styles/console.css';

const app = createApp(App);
app.provide('dataSource', createDataSource());
app.use(router).use(i18n).mount('#app');
