import Vue from 'vue';
import VueRouter from 'vue-router';
import App from './../App.vue'
import Dashboard from '@/components/Dashboard.vue';
import OktaVue, {LoginCallback} from '@okta/okta-vue'
import { OktaAuth } from '@okta/okta-auth-js'

Vue.use(VueRouter)

const oktaAuth = new OktaAuth({
issuer: 'https://dev-2451190.okta.com/oauth2/default',
clientId: '0oa3i9gjxQEeizaxa5d6',
redirectUri:'http://localhost:8080/implicit/callback',
scopes: ['openid', 'profile', 'email']
})
Vue.use(OktaVue, { oktaAuth })


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