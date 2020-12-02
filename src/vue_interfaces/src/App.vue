<template>
  <div id="app">
    <Header />
  </div>
</template>





<script>
import Header from './components/Header.vue'

export default {
  name: 'App',
  components: {
    Header
  }
}
</script>





<style>
  #app {
    background-color: #34495e;
    color: #34495e;
  }

  h3 {
    font-size: 28px;    
    font-family: 'Dosis', sans-serif;
  }

  h4 {
    font-size: 24px;    
    font-family: 'Dosis', sans-serif;
  }
</style>