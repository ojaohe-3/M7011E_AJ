<template>
  <div id="app">
    <Header  v-bind:loggedIn="false" v-on:logout="logout()"/>
    <Login @login="login"/>
    <Dashboard v-if="showDashboard" :id="id" :userType="userType"/>
  </div>
</template>




<script>
import Header from './components/Header.vue'
import Dashboard from './components/Dashboard.vue'
import Login from './components/Login.vue'
export default {
  name: 'App',
  components: {
    Header,
    Dashboard,
    Login
  },data () {
    return {
      showDashboard: false,
      id: '',
      userType: ''
    }
  },
  methods: {
    logout(){
      this.showDashboard = false;
      //TODO set state to default.
  },
  login(user){
    console.log(user);
    if(user.main){
      this.id = user.main;
    }
      this.userType = user.type;
      this.showDashboard = true; 
      
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