import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './../App.vue'
import Empty from './../components/Empty.vue'
// import Login from './../components/Login.vue'
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
            path: '/',
            name: 'Home',
            component: App,
          },      {
            path: '/empty',
            name: 'Empty',
            component: Empty,
            meta : {
                requiresAuth: true
            }
          },
    ]
})

export default router