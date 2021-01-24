<template>
  <div id="app">
    <Header  v-bind:loggedIn="false" v-on:logout="auth.logout()"/>
    <ul>
      <li>
        <div> 
        <router-link to="/login">Log in</router-link>
        </div>
      </li>
      <li>
        <div>
        <router-link to="/dashboard">Dashboard</router-link>
        </div>
      </li>
    </ul>
  </div>
</template>




<script>
import Header from './components/Header.vue'
export default {
  name: 'App',
  components: {
    Header
  },data () {
    return {
      loggedIn: false
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