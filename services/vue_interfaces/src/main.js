import Vue from 'vue';
import App from './App.vue'
import router from './router'
import Vuex from 'vuex'

Vue.use(Vuex)
Vue.config.productionTip = false


const store = new Vuex.Store({
    state: {
      token: '',
      userdata: {},
    },
    mutations: {
        LOGIN_TOKEN (state, res) {
        state.token = res.data.jwt;
        state.userdata = res.data.user; 
      }
    }
  })

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')
