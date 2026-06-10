// src/router/index.ts
import { createRouter, createWebHashHistory, type RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: () => import('@/views/HomeView.vue') },
  { path: '/catalog', name: 'catalog', component: () => import('@/views/CatalogView.vue') },
  {
    path: '/capability/:id',
    name: 'capability',
    component: () => import('@/views/CapabilityDetailView.vue')
  },
  { path: '/how-it-works', name: 'how', component: () => import('@/views/HowItWorksView.vue') },
  {
    path: '/console',
    name: 'console',
    component: () => import('@/views/console/DashboardView.vue')
  },
  {
    path: '/console/services',
    name: 'console-services',
    component: () => import('@/views/console/ServicesView.vue')
  },
  {
    path: '/console/connect',
    name: 'console-connect',
    component: () => import('@/views/console/ConnectView.vue')
  },
  {
    path: '/console/usage',
    name: 'console-usage',
    component: () => import('@/views/console/UsageView.vue')
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'notfound',
    component: () => import('@/views/NotFoundView.vue')
  }
];

export const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes
});
