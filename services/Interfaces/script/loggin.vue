<template>
  <div id="loggin">
    <!--<h3>Username:</h3>
    <input type="text" v-model="username">
    <h3>Password:</h3>
    <input type="password" v-model="password" \>
    <button v-on:click="valuesIntoJson">Loggin</button>
    <div class="yellowLine"></div>
    <div class="blueLine"></div>-->
    <!--it looks like my js file isn't connected...-->
    <!--<p>Tests to see what my Vue.js values contain:</p> 
    <p>Value of my username : {{ username }}</p>
    <p>Value of my password : {{ password }}</p>
    <p>Value of userInfo : {{ userInfo }}</p>-->
  </div>
</template>

<script>
export default {
  name: 'loggin',
  data: {
    username: '',
    password: '',
    userInfo: {}
  },
  methods: {
    valuesIntoJson: function(username, password) {
      this.userInfo = {
        "username": username,
        "password": saltedSha256(password)
      }
    }
  }
}
</script>

<!--<style scoped>
  h3 {
    font-size: 28px;    
    font-family: 'Dosis', sans-serif;
  }

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
</style>-->
