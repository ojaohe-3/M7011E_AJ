<template>
  <div id="loggin">
    <h3>Username:</h3>
    <input type="text" id="username" v-model="username">
    <h3>Password:</h3>
    <input type="password" id="password" v-model="password" />
    <button id="Login" v-on:click="login()">Login</button>
    <div class="yellowLine"></div>
    <div class="blueLine"></div>
  </div>
</template>



<script>
export default {
  name: 'login',
  data() {
        return {
          loggedIn : false,
        }
  },
  methods: {
    
      login () {
      }
  },
}
</script>




<style scoped>
  #loggin {
    display: block;
    width: 25%;
    margin-left: auto;
    margin-right: auto;
    background-color: #ecf0f1;
    color: #34495e;
    padding: 25px;
    padding-top: 10px;
  }

  input {
    width: 96%;
    color: #34495e;
    font-size: 20px;
    height: 35px;
    border-color: #34495e;
    padding-left: 5px;
    padding-right: 5px;
  }

  button {
    margin-top: 30px;
    padding: 10px;
    width: fit-content;
    position: relative;
    left: 30%;
    font-size: 28px;
    color: #34495e;
    font-family: 'Dosis', sans-serif;
  }

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

  @media screen and (max-width: 1100px) {
    #loggin {
        width: 40%;
    }
  }

  @media screen and (max-width: 600px) {
    #loggin {
        width: 60%;
    }
  }
</style>
