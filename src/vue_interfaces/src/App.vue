<template>
  <div id="app">
    <Header v-bind:userType = "userType" v-on:loggout="userType = 'login'" />
  </div>
</template>




<script>
import Header from './components/Header.vue'
import auth from './auth'

export default {
  name: 'App',
  components: {
    Header
  },data () {
    return {
      loggedIn: auth.loggedIn()
    }
  },
  created () {
    auth.onChange = loggedIn => {
      this.loggedIn = loggedIn
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