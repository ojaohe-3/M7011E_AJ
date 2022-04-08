<template>
    <table id="consumer">
        <tr>
            <td v-bind="consumption">
                <div class="block">
                    <h3>My Consumption</h3>
                    <h4>{{ consumption }} kw/h</h4>
                    <div id="yellowLine1"></div>
                    <div id="blueLine1"></div>
                </div>
            </td>
            <td v-bind="elecPrice">
                <div class="block">
                    <div id="blueLine2"></div>
                    <h3>Price of Electricity</h3>
                    <h4>{{ elecPrice }} kr/kw</h4>
                    <div id="yellowLine2"></div>
                </div>
            </td>
        </tr>
    </table>
</template>



<script>
import axios from 'axios'
export default {
  name: 'Consumer',
  props : ['id'],
  data() {

      return {
          consumption: 3500,
          elecPrice: 0.73,
          cost: 0.73*3500
      }
  },
  created () {
        const update = async () => {

            const market = await axios.get(process.env.VUE_APP_MARKET_ENDPOINT+"/api/price");
            const consumer = await axios.get(process.env.VUE_APP_SIM_ENDPOINT+'/api/members/consumers/'+ this.id);
            console.log(`this: ${market}, ${consumer}`)
            this.cost = consumer.demand * market.price;
            this.elecPrice = market.price;
            
            this.elecDemand = market.stats.totalDemand;
        }
        setInterval(update, 1000);
    }
  }

</script>




<style scoped>
#consumer {
    width: 75%;
    text-align: center;
    border-spacing: 90px;
    margin-left: auto;
    margin-right: auto;
}

.block {
    background-color: #ecf0f1;
    padding: 30px;
}

#yellowLine1 {
    width: 135%;
    height: 8px;
    background-color: #f1c40f;
    position: relative;
    top: 30px;
    right: 50px;
    border-radius: 25px;
}

#blueLine1 {
    width: 8px;
    height: 260px;
    background-color: #3498db;
    float: left;
    position: relative;
    right: 30px;
    bottom: 220px;
    border-radius: 25px;
}

#yellowLine2 {
    width: 8px;
    height: 260px;
    background-color: #f1c40f;
    float: left;
    position: relative;
    right: 30px;
    bottom: 220px;
    border-radius: 25px;
}

#blueLine2 {
    width: 135%;
    height: 8px;
    background-color: #3498db;
    position: relative;
    bottom: 30px;
    right: 50px;
    border-radius: 25px;
}

@media screen and (max-width: 1150px) {
    #consumer {
        width: 85%;
    }
}

@media screen and (max-width: 950px) {
    #consumer {
        width: 95%;
        border-spacing: 40px;
    }
}

@media screen and (max-width: 650px) {
    #consumer {
        width: 100%;
        border-spacing: 10px;
    }

    #yellowLine1 {
        right: 32px;
    }
}
</style>
