<template>
    <div id="manager">
        <table class="largeScreen">
            <tr>
                <td v-bind="elecPrice">
                    <h3>Price of Electricity</h3>
                    <h4>{{ elecPrice }} kr/kw</h4>
                    <input type="text" v-model="elecPrice" placeholder="1.5">
                    <!--<button style="display: inline;">Submit</button>-->
                </td>
                <td v-bind="production">
                    <h3>My Production</h3>
                    <h4>{{ production }} kw/h</h4>
                    <input type="number" min="0" v-model="production"  v-on:input="productionStep" placeholder="3500">
                    <!--<button style="display: inline;">Submit</button>-->
                </td>
                <td v-bind="elecDemand" rowspan="2">
                    <h3>Electricity Demand</h3>
                    <h4>{{ elecDemand }} kw/h</h4>
                </td>
            </tr>
            <tr>
                <td v-bind="income">
                    <h3>Income from prosumer</h3>
                    <h4>{{ income }} kw/h</h4>
                </td>
                <td v-bind="totalAvailable">
                    <h3>Total Electicity Available</h3>
                    <h4>{{ totalAvailable }} kw/h</h4>
                </td>
            </tr>
            <tr>
                <td colspan="3">
                    <h3>My prosumers</h3>
                    <ul id="prosumers">
                        <li v-bind:key="prosumer.id" v-for="prosumer in prosumers">
                            Id : {{ prosumer.id }} ; 
                            Consumption from the market : {{ prosumer.marketConsumption }} ; 
                            Production to the market : {{ prosumer.marketProduction }}
                            <img src="../assets/thinArrow.png" width="20px">
                            <input type="checkbox" id="disableMarketProd"> disabled
                        </li>
                    </ul>
                    <h3>My consumers</h3>
                    <ul id="consumer">
                        <li v-bind:key="consumer.id" v-for="consumer in consumers">
                            Id : {{ consumer.id }} ; 
                            Consumption from the market : {{ consumer.marketConsumption }}
                        </li>
                    </ul>
                </td>
            </tr>
        </table>

        <table class="smallScreen">
            <tr>
                <td v-bind="elecPrice" colspan="2">
                    <h3>Price of Electricity</h3>
                    <h4>{{ elecPrice }} kr/kw</h4>
                    <input type="text" v-model="elecPrice" placeholder="1.5">
                    <!--<button style="display: inline;">Submit</button>-->
                </td>
            </tr>
            <tr>
                <td v-bind="production">
                    <h3>My Production</h3>
                    <h4>{{ production }} kw/h</h4>
                    <input type="number" min="0" v-model="production" v-on:input="productionStep" placeholder="3500">
                    <!--<button style="display: inline;">Submit</button>-->
                </td>
                <td v-bind="income">
                    <h3>Income from prosumer</h3>
                    <h4>{{ income }} kw/h</h4>
                </td>
            </tr>
            <tr>
                <td v-bind="elecDemand">
                    <h3>Electricity Demand</h3>
                    <h4>{{ elecDemand }} kw/h</h4>
                </td>
                <td v-bind="totalAvailable">
                    <h3>Total Electicity Available</h3>
                    <h4>{{ totalAvailable }} kw/h</h4>
                </td>
            </tr>
            <tr>
                <td colspan="2">
                    <h3>My prosumers</h3>
                    <ul id="prosumers">
                        <li v-bind:key="prosumer.id" v-for="prosumer in prosumers">
                            Id : {{ prosumer.id }} ; 
                            Consumption from the market : {{ prosumer.marketConsumption }} ; 
                            Production to the market : {{ prosumer.marketProduction }}
                            <img src="../assets/thinArrow.png" width="20px">
                            <input type="checkbox" id="disableMarketProd"> disabled
                        </li>
                    </ul>
                    <h3>My consumers</h3>
                    <ul id="consumer">
                        <li v-bind:key="consumer.id" v-for="consumer in consumers">
                            Id : {{ consumer.id }} ; 
                            Consumption from the market : {{ consumer.marketConsumption }}
                        </li>
                    </ul>
                </td>
            </tr>
        </table>
    </div>
</template>



<script>
import FetchComponent from './FetchComponent';

export default {
    name: 'Manager',
    props: ["id"],
    data() {
        return {
            elecPrice: 0.73,
            production: 37100,
            elecDemand: 56300,
            ratio: 100,
            income: 25300,
            totalAvailable: 62400,
            maxProduction: 50000,
            consumption: 3140
        }
    },
    mounted() {
        const update = () => {

            const market = FetchComponent._get(process.env.VUE_APP_MARKET_ENDPOINT+"/api/price", 'token');
            const manager = FetchComponent._get(process.env.VUE_APP_MANAGER_ENDPOINT+"/api/members/"+this.id, 'token');

            this.elecPrice = market.price;
            this.production = manager.production;
            this.elecDemand = market.totalDemand;
            this.maxProduction = manager.maxProduction();
            this.income = this.production * this.elecPrice;
            this.totalAvailable = manager.maxProduction;

        }
        setInterval(update, 1000);

    },
    methods: {
        productionStep(){
            const r = this.production/this.maxProduction;
            FetchComponent._post(process.env.VUE_APP_MANAGER_ENDPOINT+"/api/control", {"ratio": r}, 'token');
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

@media screen and (max-width: 1200px) {
    table {
        border-spacing: 35px;
    }
}

@media screen and (max-width: 860px) {
    table {
        border-spacing: 5px;
    }
}

@media screen and (max-width: 780px) {
    .largeScreen {display: none;}
    .smallScreen {display: block;}
    td {
        width: 350px;
        padding: 5px;
    }
}
</style>
