import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './../App.vue'
import Dashboard from '@/components/Dashboard.vue';

Vue.use(VueRouter)




Vue.productionTip = false;


const router = new VueRouter({
    mode: 'history',
    base: "http://localhost:8080",
    routes: [
    
        {
            path: '/dashboard',
            name: 'Dashboard',
            component: Dashboard,
            meta : {
                requiresAuth: true
            }
        },
        {
            path: '/implicit/callback',
            component: LoginCallback
        },
        {
            path: '/',
            name: 'Home',
            component: App,
          },
    ]
})

export default router