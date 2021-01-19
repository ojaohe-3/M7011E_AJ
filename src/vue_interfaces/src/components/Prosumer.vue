<template>
    <div id="prosumer">
        <table class="largeScreen">
            <tr>
                <td v-bind="production">
                    <h3>My Production</h3>
                    <h4>{{ production.toFixed(2) }} kw/h</h4>
                </td>
                <td v-bind="battery">
                    <h3>My Battery</h3>
                    <h4>{{ battery }} %</h4>
                </td>
                <td v-bind="elecPrice">
                    <h3>Price of Electricity</h3>
                    <h4>{{ elecPrice.toFixed(2) }} kr/kw</h4>
                </td>
            </tr>
            <tr>
                <td v-bind="consumption">
                    <h3>My Consumption</h3>
                    <h4>{{ consumption.toFixed(2) }} kw/h</h4>
                </td>
                <td v-bind="ratio">
                    <h3>Ratio to my Battery</h3>
                    <h4>{{ ratio }} %</h4>
                    <input type="number" min="0" max="100" v-model="ratio" v-on:input="ratioStep" placeholder="70">
                    <!--<button style="display: inline;">Submit</button>-->
                </td>
                <td v-bind="marketConsumption">
                    <h3>My Consumption from the Market</h3>
                    <h4>{{ marketConsumption.toFixed(2) }} kw/h</h4>
                </td>
            </tr>
        </table>

        <table class="smallScreen">
            <tr>
                <td v-bind="production">
                    <h3>My Production</h3>
                    <h4>{{ production.toFixed(2) }} kw/h</h4>
                </td>
                <td v-bind="elecPrice">
                    <h3>Price of Electricity</h3>
                    <h4>{{ elecPrice.toFixed(2) }} kr/kw</h4>
                </td>
                
            </tr>
            <tr>
                <td v-bind="battery">
                    <h3>My Battery</h3>
                    <h4>{{ battery }} %</h4>
                </td>
                <td v-bind="ratio">
                    <h3>My Ratio Battery/market</h3>
                    <h4>{{ ratio }} %</h4>
                    <input type="number" min="0" max="100" v-model="ratio"  v-on:input="ratioStep" placeholder="70">
                    <!--<button style="display: inline;">Submit</button>-->
                </td>
                
            </tr>
            <tr>
                <td v-bind="consumption">
                    <h3>My Consumption</h3>
                    <h4>{{ consumption.toFixed(2) }} kw/h</h4>
                </td>
                <td v-bind="marketConsumption">
                    <h3>My Consumption from the Market</h3>
                    <h4>{{ marketConsumption.toFixed(2) }} kw/h</h4>
                </td>
            </tr>
        </table>
    </div>
</template>



<script>
import axios from 'axios'
export default {
  name: 'Prosumer',
 props: ["id"],
  data() {
    return {
        production: 2400,
        battery: 74,
        elecPrice: 0.73,
        consumption: 3140,
        cost: 0,
        ratio: 70,
        marketConsumption: 0
    }
  },
   created () {
       
        setInterval(this.update, 1000);
    },
    methods: {
        async ratioStep(){
            await axios.put(process.env.VUE_APP_PROSUMER_ENDPOINT+"/api/control/"+this.id, {"input_ratio": this.ratio/100, "output_ratio": 1 - this.ratio/100});
        },
         async update(){
            let market, prosumer, control,consumer = null;
            await axios.get(process.env.VUE_APP_MARKET_ENDPOINT+"/api/price").then(res=> market = res.data).catch(err => console.log(err));
            await axios.get(process.env.VUE_APP_PROSUMER_ENDPOINT+"/api/members/"+this.id).then(res=> prosumer = res.data).catch(err => console.log(err));
            await axios.get(process.env.VUE_APP_SIM_ENDPOINT+"/api/members/consumers/"+this.id).then(res=> consumer = res.data).catch(err => console.log(err));
            await axios.get(process.env.VUE_APP_PROSUMER_ENDPOINT+"/api/control/"+this.id).then(res=> control = res.data).catch(err => console.log(err));
            this.cost = (consumer.demand - this.production ) * market.price;
            this.elecPrice = market.price;
            this.elecDemand = market.stats.totalDemand;
 
            this.ratio = control.input_ratio*100;
            this.production = prosumer.totalProduction;
            this.consumption = consumer.demand;

            this.marketConsumption = this.production - this.consumption;

            let current = 0;
            prosumer.batteries.forEach(e => current += e.current)
            this.battery = current / prosumer.totalCapacity;
            

        }
    },
}
</script>




<style scoped>
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

@media screen and (max-width: 1000px) {
    table {
        border-spacing: 40px;
    }
}

@media screen and (max-width: 860px) {
    table {
        border-spacing: 10px;
    }
}

@media screen and (max-width: 780px) {
    .largeScreen {display: none;}
    .smallScreen {display: block;}
    td {
        width: 350px;
        padding: 10px;
    }
}
</style>
