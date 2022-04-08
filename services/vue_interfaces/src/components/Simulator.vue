<template>
    <div id="simulator">
        <h3>Electricity grid</h3>
        <div id="legend">
            <div class="legendBlock"><img src="../assets/lightBlueDot.png" alt="lightBlueDot" class="colorDot"> Consumer</div>
            <div class="legendBlock"><img src="../assets/yellowDot.png" alt="yellowDot" class="colorDot"> Manager</div>
            <div class="legendBlock"><img src="../assets/darkBlueDot.png" alt="darkBlueDot" class="colorDot"> Prosumer</div>
        </div>
        <div>
            <img src="../assets/simulatorMap.png" id="simulatorMap" width="950" height="499" usemap="#simulatorMap">
            <map name="simulatorMap">
                <area shape="circle" coords="50, 150, 35, 35" href="./consumer.html" class="consumer">
                <area shape="circle" coords="140, 395, 35, 35" href="./prosumer.html" class="prosumer">
                <area shape="circle" coords="260, 240, 35, 35" href="./prosumer.html" class="prosumer">
                <area shape="circle" coords="377, 85, 35, 35" href="./consumer.html" class="consumer">
                <area shape="circle" coords="425, 330, 35, 35" href="./consumer.html" class="consumer">
                <area shape="circle" coords="620, 205, 35, 35" href="./prosumer.html" class="prosumer">
                <area shape="circle" coords="690, 55, 35, 35" href="./prosumer.html" class="prosumer">
                <area shape="circle" coords="720, 395, 35, 35" href="./manager.html" class="manager">
                <area shape="circle" coords="895, 120, 35, 35" href="./consumer.html" class="consumer">
                <area shape="circle" coords="900, 280, 35, 35" href="./consumer.html" class="consumer">
            </map>
            <div class="yellowLine"></div>
            <div class="blueLine"></div>
        </div>
    </div>
</template>



<script>
export default {
  name: 'Simulator',
}
</script>




<style scoped>
#simulator {
    display: block;
    width: 75%;
    margin-left: auto;
    margin-right: auto;
    background-color: #ecf0f1;
    color: #34495e;
    padding: 15px;
}

#legend {
    float: left;
}

.colorDot {
    height: 30px;
    position: relative;
    top: 10px;
}

#simulatorMap {
    width: 80%;
    height: auto;
}

.yellowLine {
    width: 115%;
    height: 8px;
    background-color: #f1c40f;
    float: left;
    position: relative;
    top: 7px;
    right: 8%;
    border-radius: 25px;
}

.blueLine {
    width: 8px;
    height: 650px;
    background-color: #3498db;
    float: left;
    position: relative;
    right: 20px;
    bottom: 610px;
    border-radius: 25px;
}

@media screen and (max-width: 1230px) {
    .blueLine {
        height: 540px;
        bottom: 505px;
    }
}

@media screen and (max-width: 1000px) {
    .blueLine {
        height: 490px;
        bottom: 450px;
    }
}

@media screen and (max-width: 800px) {
    #simulatorMap {
        width: 95%;
    }

    .legendBlock {
        display: inline;
    }

    .blueLine {
        height: 480px;
        bottom: 450px;
    }
}

@media screen and (max-width: 600px) {
    #simulator .blueLine {
        height: 400px;
        bottom: 370px;
    }
}
</style>
