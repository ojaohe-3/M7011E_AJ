<template>
  <div id="empty">
      <Header  v-bind:loggedIn="true" v-on:logout="logout()"/>
    <center>
        <div class="card">
            <h3>You have no assigned producer</h3>
            <p>register here:</p><br />
            <router-link to="/service/register">Send an application</router-link><br />
            <router-link to="/simulator">Go to Sim</router-link>
        </div>
            <div class="yellowLine"></div>
            <div class="blueLine"></div>
    </center>
  </div>
</template>



<script>
// import axios from "axios";
import Header from './Header.vue'
export default {
  name: "Empty",
  components: {
      Header, 
  },
  methods: {
      logout(){
          this.$router.push('/');
      }
  }
};
</script>




<style scoped>
.yellowLine {
    width: 8px;
    height: 450px;
    background-color: #f1c40f;
    float: left;
    position: relative;
    right: 25px;
    bottom: 300px;
    border-radius: 25px;
  }

  .blueLine {
    width: 150%;
    height: 8px;
    background-color: #3498db;
    position: relative;
    top: 25px;
    right: 50px;
    border-radius: 25px;
  }
.ex8 .parent {
    height: auto;
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: repeat(3, 1fr);
  }

  .ex8 .visual {
    height: 100px;
    width: 100%;
  }

  .ex8 .card {
    display: flex;
    flex-direction: column;
    padding: 1rem;
    justify-content: space-between;
  }

  .ex8 h3 {
    margin: 0
  }
</style>
