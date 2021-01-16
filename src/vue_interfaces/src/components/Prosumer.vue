<template>
    <div id="prosumer">
        <table class="largeScreen">
            <tr>
                <td v-bind="production">
                    <h3>My Production</h3>
                    <h4>{{ production }} kw/h</h4>
                </td>
                <td v-bind="battery">
                    <h3>My Battery</h3>
                    <h4>{{ battery }} %</h4>
                </td>
                <td v-bind="elecPrice">
                    <h3>Price of Electricity</h3>
                    <h4>{{ elecPrice }} kr/kw</h4>
                </td>
            </tr>
            <tr>
                <td v-bind="consumption">
                    <h3>My Consumption</h3>
                    <h4>{{ consumption }} kw/h</h4>
                </td>
                <td v-bind="ratio">
                    <h3>Ratio to my Battery</h3>
                    <h4>{{ ratio }} %</h4>
                    <input type="number" min="0" max="100" v-model="ratio" v-on:input="ratioStep" placeholder="70">
                    <!--<button style="display: inline;">Submit</button>-->
                </td>
                <td v-bind="marketConsumption">
                    <h3>My Consumption from the Market</h3>
                    <h4>{{ marketConsumption }} kw/h</h4>
                </td>
            </tr>
        </table>

        <table class="smallScreen">
            <tr>
                <td v-bind="production">
                    <h3>My Production</h3>
                    <h4>{{ production }} kw/h</h4>
                </td>
                <td v-bind="elecPrice">
                    <h3>Price of Electricity</h3>
                    <h4>{{ elecPrice }} kr/kw</h4>
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
                    <h4>{{ consumption }} kw/h</h4>
                </td>
                <td v-bind="marketConsumption">
                    <h3>My Consumption from the Market</h3>
                    <h4>{{ marketConsumption }} kw/h</h4>
                </td>
            </tr>
        </table>
    </div>
</template>



<script>
import FetchComponent from './FetchComponent';

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
   mounted () {
        const update = () => {

            const market = FetchComponent._get(process.env.VUE_APP_MARKET_ENDPOINT+"/api/price", 'token');
            const simulator = FetchComponent._get(process.env.VUE_APP_MARKET_ENDPOINT+"/api/data", 'token');
            const prosumer = FetchComponent._get(process.env.VUE_APP_PROSUMER_ENDPOINT+"/api/members/"+this.id, 'token');
            const consumer = FetchComponent._get(process.env.VUE_APP_SIM_ENDPOINT+"/api/members/consumers/"+this.id, 'token'); //todo fix the prefix with the aformentioned deployment

            this.cost = (consumer.demand - this.production ) * market.price;
            
            this.elecPrice = market.price;
            this.elecDemand = simulator.totalDemand;
            this.ratio = prosumer.ratio;
            this.production = prosumer.totalProduction;
            this.consumption = consumer.demand;

            this.marketConsumption = this.production - this.consumption;

            this.battery = prosumer.totalCapacity;
            

        }
        setInterval(update, 1000);
    },
    methods: {
        ratioStep(){
            FetchComponent._post(process.env.VUE_APP_PROSUMER_ENDPOINT+"/api/control", {"ratio": this.ratio});//todo validate this
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
