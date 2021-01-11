import Vue from 'vue';
import VueRouter from 'vue-router';
import Home from '@/components/Home';
import Login from '@/components/Loggin';
import Auth from '@okta/okta-vue'
import { OktaAuth } from '@okta/okta-auth-js'

Vue.config.productionTip = false
Vue.use(VueRouter);
const oktaAuth = new OktaAuth({
  issuer: process.env.VUE_APP_ISSUER+'/oauth2/default',
  clientId: process.env.VUE_APP_CLIENT_ID,
  redirectUri: window.location.origin + '/login/callback',
  scopes: ['openid', 'profile', 'email']
});

Vue.use(Auth, { oktaAuth });

const router = new VueRouter({
  mode: 'history',
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/login/callback',
      component: Auth.handleCallback()
    },
    {
      path: '/profile',
      component: Home,
      meta: {
        requiresAuth: true
      }
    }
  ]
})

const onAuthRequired = async (from, to, next) => {
  if (from.matched.some(record => record.meta.requiresAuth) && !(await Vue.prototype.$auth.isAuthenticated())) {
    // Navigate to custom login page
    next({ path: '/login' })
  } else {
    next()
  }
}

router.beforeEach(onAuthRequired)

export default router