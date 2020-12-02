<template>
  <div id="app">
    <Header />
    <Loggin />
    <Consumer />
    <Simulator />
    <Prosumer />
    <Manager />
  </div>
</template>




<script>
import Header from './components/Header.vue'
import Loggin from './components/Loggin.vue'
import Consumer from './components/Consumer.vue'
import Simulator from './components/Simulator.vue'
import Prosumer from './components/Prosumer.vue'
import Manager from './components/Manager.vue'

export default {
  name: 'App',
  components: {
    Header,
    Loggin,
    Consumer,
    Simulator,
    Prosumer,
    Manager
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