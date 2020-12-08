<template>
  <div id="app">
    <Header v-bind:userType = "userType" v-on:loggout="userType = 'loggin'" />
    <Loggin v-if="userType === 'loggin'" /> <!-- v-on:loggedIn="userType = newUserType" -->
    <Consumer v-if="userType === 'consumer'" />
    <!-- <Simulator v-if="(userType === 'manager' && nextPage === 'simulator')" /> -->
    <Prosumer v-if="userType === 'prosumer'" />
    <Manager v-if="userType === 'manager'" />
  </div>
</template>




<script>
import Header from './components/Header.vue'
import Loggin from './components/Loggin.vue'
import Consumer from './components/Consumer.vue'
//import Simulator from './components/Simulator.vue'
import Prosumer from './components/Prosumer.vue'
import Manager from './components/Manager.vue'

export default {
  name: 'App',
  components: {
    Header,
    Loggin,
    Consumer,
    //Simulator,
    Prosumer,
    Manager
  },
  data () {
    return {
      userType: 'loggin' // put 'loggin' by default
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