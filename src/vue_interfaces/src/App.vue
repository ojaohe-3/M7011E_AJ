<template>
  <div id="app">
    <Header  v-bind:loggedIn="false" v-on:logout="auth.logout()"/>
    <!-- <Login/> -->
    <h3>Temporary untill callback is fixed!</h3>
    <table class="largeScreen">
      <tr>
         <td>
           <div class="block">
           <h3>Prosumer</h3>
           <button v-on:click ="setProsumer">+</button>
           </div>
         </td>
          <td>
           <div class="block">
           <h3>Manager</h3>
           <button v-on:click ="setManager">+</button>
           </div>
         </td>
      </tr>
    </table>
    <Dashboard v-if="showDashboard" :id="id" :userType="userType"/>
  </div>
</template>




<script>
import Header from './components/Header.vue'
import Dashboard from './components/Dashboard.vue'
export default {
  name: 'App',
  components: {
    Header,
    Dashboard
  },data () {
    return {
      showDashboard: false,
      id: '',
      userType: ''
    }
  },
  methods: {
    setProsumer(){
      this.id = "5fd906c32f18d95e7d7dd1aa"
      this.userType = 'prosumer'
      this.showDashboard = true
    },
    setManager(){
      this.id = "5fe61e5dc085f56a7fc10199"
      this.userType = 'manager'
      this.showDashboard = true
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
  .block {
    background-color: #ecf0f1;
    padding: 30px;
}
table {
    width: 100%;
    text-align: center;
    border-spacing: 70px;
    margin-left: auto;
    margin-right: auto;
}

td {
    background-color: #ecf0f1;
    padding: 30px;
    width: 180px;
}

.smallScreen {
    display: none;
}

</style>