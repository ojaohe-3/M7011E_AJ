import VueRouter from 'vue-router';
import Dashboard from '@/components/Dashboard.vue';
import Login from '@/components/Login.vue';
import {LoginCallback} from '@okta/okta-vue'
import { OktaAuth } from '@okta/okta-auth-js'
import OktaVue from '@okta/okta-vue'

const oktaAuth = new OktaAuth({
issuer: 'https://dev-2451190.okta.com/oauth2/default',
clientId: '0oa3i9gjxQEeizaxa5d6',
redirectUri: window.location.origin + '/login/callback',
scopes: ['openid', 'profile', 'email']
})
Vue.use(OktaVue, { oktaAuth })


Vue.use(VueRouter)
Vue.productionTip = false;

const NotFound = {
    template: "<div>Page not found</div>"
};
const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
    
        {
            path: '/dashboard',
            component: Dashboard
        },
        {
            path: '/login',
            component: Login
        },
        {
            path: '/login/callback',
            component: LoginCallback
        },
        {
            path: '*',
            NotFound
        }
    ]
})

export default router