<template>
  <div id="dashboard">
    <Prosumer v-bind="id" v-if="userType === 'prosumer'"/>
    <Manager v-bind="id" v-if="userType === 'manager'"/>
    <Consumer v-bind="id" v-if="userType === 'consumer'"/>
  </div>
</template>




<script>
import Manager from './Manager.vue'
import Prosumer from './Prosumer.vue'
import Consumer from './Consumer.vue'

// import auth from '../auth'

export default {
  name: 'Dashboard',
  components: {
    Manager,
    Prosumer,
    Consumer
    
  },data () {
    return {
      userType: 'consumer',
      loggedin: true, //this is temporary untill oauth is fixed
      id: ''
    }
  },
  created () {
    // axios.get(process.env.VUE_APP_LOGIN_API, auth.getToken())
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