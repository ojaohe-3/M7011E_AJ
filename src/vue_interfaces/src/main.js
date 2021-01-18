import Vue from 'vue';
import VueRouter from 'vue-router';
import auth from './auth';
import Dashboard from './components/Dashboard.vue';
import Login from './components/Login.vue';
import App from './App.vue'
Vue.use(VueRouter)

const router = new VueRouter({
  mode: 'history',
  base: __dirname,
  routes: [
    { path: '/dashboard', component: Dashboard },
    { path: '/login', component: Login },
    { path: '/logout',
      beforeEnter (to, from, next) {
        auth.logout()
        next('/')
      }
    }
  ]
})

// function requireAuth (to, from, next) {
//   if (!auth.loggedIn()) {
//     next({
//       path: '/login',
//       query: { redirect: to.fullPath }
//     })
//   } else {
//     next()
//   }
// }

Vue.config.productionTip = false
Vue.directive('focus', {
  // When the bound element is inserted into the DOM...
  inserted: function (el) {
    // Focus the element
    el.focus()
  }
})

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

