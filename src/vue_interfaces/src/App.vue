<template>
  <div id="app">
    <Header v-bind:userType = "userType" v-on:loggout="userType = 'loggin'" />
    <Loggin v-bind:userType = "userType" v-if="userType === 'loggin'" v-on:loggedIn="updateUserType"/>
    <Consumer v-if="userType === 'consumer'" />
    <Prosumer v-if="userType === 'prosumer'" />
    <Manager v-if="userType === 'manager'" />
  </div>
</template>




<script>
import Header from './components/Header.vue'
import Loggin from './components/Loggin.vue'
import Consumer from './components/Consumer.vue'
import Prosumer from './components/Prosumer.vue'
import Manager from './components/Manager.vue'

export default {
  name: 'App',
  components: {
    Header,
    Loggin,
    Consumer,
    Prosumer,
    Manager
  },
  data () {
    return {
      userType: 'loggin' // put 'loggin' by default
    }
  },
  methods: {
    updateUserType(type) {
      this.userType = type;
    }
  }
}
</script>




<style>
  h3 {
    font-size: 28px;    
    font-family: 'Dosis', sans-serif;
  }

  h4 {
    font-size: 24px;    
    font-family: 'Dosis', sans-serif;
  }
</style>