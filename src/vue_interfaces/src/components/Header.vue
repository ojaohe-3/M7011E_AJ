<template>
  <header>
    <img src="../assets/logo.png" alt="logo" id="logo">
    <h1>Green Lean Electric, loggin</h1>
    <div class="headerLine"></div>
  </header>
</template>




<script>
export default {
  name: 'Header',
}
</script>




<style scoped>
header {
  color: #ecf0f1;
  display: block;
  width: 100%;
  margin-bottom: 50px;
  text-align: center;
  font-size: 38px;
  font-weight: bold;
  font-family: 'Dosis', sans-serif;
}

#logo {
  height: 130px;
  float: left;
  position: relative;
  top: 30px;
  left: 30px;
}

header h1 {
  display: inline-block;
  position: relative;
}

#exit {
  height: 50px;
  position: absolute;
  right: 20px;
  top: 20px;
  display: inline-block;
}

.headerLine {
  display: block;
  background-color: #ecf0f1;
  height: 10px;
  width: 65%;
  border-radius: 25px;
  position: absolute;
  left: 23%;
}

@media screen and (max-width: 1150px) {
  header {
    font-size: 30px;
  }

  #logo {
    height: 100px;
  }

  #exit {
    height: 40px;
  }
}

@media screen and (max-width: 950px) {
  header {
    font-size: 28px;
  }

  header h1 {
    margin-left: 100px;
  }

  #logo {
    height: 80px;
  }

  #exit {
    height: 30px;
  }
}
</style>
