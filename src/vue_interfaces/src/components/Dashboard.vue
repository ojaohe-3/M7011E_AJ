<template>
  <div id="dashboard">
    <Prosumer v-bind:id="this.id" v-if="userType === 'prosumer'"/>
    <Manager v-bind:id="this.id" v-if="userType === 'manager'"/>
    <Consumer v-bind:id="this.id" v-if="userType === 'consumer'"/>
  </div>
</template>




<script>
import Manager from './Manager.vue'
import Prosumer from './Prosumer.vue'
import Consumer from './Consumer.vue'
// import axios from 'axios'

export default {
  name: 'Dashboard',
  components: {
    Manager,
    Prosumer,
    Consumer
    
  },data () {
    return {
      userType: 'prosumer',
      id: '5fda7a29b6921cba5370a03a'
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