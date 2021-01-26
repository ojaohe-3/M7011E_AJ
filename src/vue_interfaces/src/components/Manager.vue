<template>
  <div id="manager">
    <table class="largeScreen">
      <tr>
        <td v-bind="elecPrice">
          <h3>Price of Electricity</h3>
          <h4>{{ elecPrice }} kr/kw</h4>
          <VueApexCharts width="300" type="line" :options="options" :series="priceSeries"/>
          <!-- <input type="text" v-model="elecPrice" placeholder="1.5"> -->
          <!--<button style="display: inline;">Submit</button>-->
        </td>
        <td v-bind="production">
          <h3>My Production</h3>
          <h4>{{ production }} kw/h</h4>
          <VueApexCharts width="300" type="line" :options="options" :series="productionSeries"/>

          <!-- <input type="number" min="0" v-model="production"  v-on:input="productionStep" placeholder="3500"> -->
          <!--<button style="display: inline;">Submit</button>-->
        </td>
        <td v-bind="elecDemand">
          <h3>Electricity Demand</h3>
          <h4>{{ elecDemand }} kw/h</h4>
          <VueApexCharts width="300" type="line" :options="options" :series="demandSeries"/>
          
        </td>
      </tr>

      <tr>
        <td v-bind="ratio">
          <h3>Input Ratio</h3>
          <h4>{{ ratio }}%</h4>
          <input
            type="number"
            min="0"
            max="100"
            v-on:input="productionStep()"
            v-model="ratio"
          />

          <input type="checkbox" v-model="status"/>
        </td>
        <td v-bind="income">
          <h3>Income</h3>
          <h4>{{ income }} kr/h</h4>
          <VueApexCharts width="300" type="line" :options="options" :series="incomeSeries"/>

        </td>
        <td v-bind="totalAvailable">
          <h3>Total Electicity Available</h3>
          <h4>{{ totalAvailable.toFixed(2) }} kw/h</h4>
          <VueApexCharts width="300" type="line" :options="options" :series="totalSeries"/>

        </td>
      </tr>
      <tr>
        <td colspan="3">
          <h3>My prosumers</h3>
          <ul id="prosumers">
            <li v-bind:key="prosumer.id" v-for="prosumer in prosumers">
              Id : {{ prosumer.id }} ; Consumption from the market :
              {{ prosumer.marketConsumption }} ; Production to the market :
              {{ prosumer.marketProduction }}
              <img src="../assets/thinArrow.png" width="20px" />
              <input type="checkbox" id="disableMarketProd" /> disabled
            </li>
          </ul>
          <h3>My consumers</h3>
          <ul id="consumer">
            <li v-bind:key="consumer.id" v-for="consumer in consumers">
              Id : {{ consumer.id }} ; Consumption from the market :
              {{ consumer.marketConsumption }}
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
          <!-- <input type="text" v-model="elecPrice" placeholder="1.5"> -->
          <!--<button style="display: inline;">Submit</button>-->
        </td>
      </tr>
      <tr>
        <td v-bind="production">
          <h3>My Production</h3>
          <h4>{{ production }} kw/h</h4>
          
          <!-- <input type="number" min="0" v-model="production" v-on:input="productionStep" placeholder="3500"> -->
          <!--<button style="display: inline;">Submit</button>-->
        </td>
        <td v-bind="income">
          <h3>Income</h3>
          <h4>{{ income }} kr</h4>
        </td>
      </tr>
      <tr>
        <td v-bind="elecDemand">
          <h3>Electricity Demand</h3>
          <h4>{{ elecDemand }} kw/h</h4>
        </td>
        <td v-bind="totalAvailable">
          <h3>Total Electicity Available</h3>
          <h4>{{ totalAvailable.toFixed(2) }} kw/h</h4>
        </td>
      </tr>
      <tr>
        <td colspan="2">
          <h3>My prosumers</h3>
          <ul id="prosumers">
            <li v-bind:key="prosumer.id" v-for="prosumer in prosumers">
              Id : {{ prosumer.id }} ; Consumption from the market :
              {{ prosumer.marketConsumption }} ; Production to the market :
              {{ prosumer.marketProduction }}
              <img src="../assets/thinArrow.png" width="20px" />
              <input type="checkbox" id="disableMarketProd" /> disabled
            </li>
          </ul>
          <h3>My consumers</h3>
          <ul id="consumer">
            <li v-bind:key="consumer.id" v-for="consumer in consumers">
              Id : {{ consumer.id }} ; Consumption from the market :
              {{ consumer.marketConsumption }}
            </li>
          </ul>
        </td>
      </tr>
    </table>
  </div>
</template>



<script>
import axios from "axios";
import VueApexCharts from "vue-apexcharts";

export default {
  name: "Manager",
  props: ["id"],
  components: {
    VueApexCharts
    },
  data() {
    return {
      elecPrice: 0,
      options: {
          chart: {
            id: 'timeSeries'
          },
          xaxis: {
              catagories: []
          }
      },
      priceSeries: [{
           name: 'price-1',
        data: []
      }],
      production: 0,
      productionSeries: [{
           name: 'production-1',
        data: []
      }],
      elecDemand: 0,
      demandSeries: [{
           name: 'demand-1',
        data: []
      }],
      ratio: 100,
      income: 0,
      incomeSeries: [{
           name: 'income-1',
        data: []
      }],
      totalAvailable: 0,
      totalSeries:[ {
           name: 'totalAvailable-1',
        data: []
      }],
      maxProduction: 0,
      consumption: 0,
      status: true
    };
  },
  created() {
    setInterval(this.update, 1000);
    setInterval(this.updateCharts, 5000);
    axios
        .get(process.env.VUE_APP_MANAGER_ENDPOINT + "/api/control/" + this.id)
        .then((res) =>{ this.ratio = res.data.ratio*100; this.status = res.data.ratio;})
        .catch((err) => console.log(err));
  },
  methods: {
    updateCharts() {
        this.priceSeries[0].data.push(this.price.toFixed(0))
        this.productionSeries[0].data.push(this.production.toFixed(0))
        this.incomeSeries[0].data.push(this.income.toFixed(0))
        this.totalSeries[0].data.push(this.totalAvailable.toFixed(0))
        this.demandSeries[0].data.push(this.demandSeries.toFixed(0))
    },
    async productionStep() {
      console.log(this.ratio);
      await axios.put(
        process.env.VUE_APP_MANAGER_ENDPOINT + "/api/control/" + this.id,
        { ratio: this.ratio / 100, status: this.status}
      );
    },

    async update() {
      let market = null;
      let manager = null;
    //   console.log(
    //     "calling " +
    //       process.env.VUE_APP_MARKET_ENDPOINT +
    //       "/api/price and " +
    //       process.env.VUE_APP_MANAGER_ENDPOINT +
    //       "/api/members/" +
    //       this.id
    //   );
      await axios
        .get(process.env.VUE_APP_MARKET_ENDPOINT + "/api/price")
        .then((res) => (market = res.data))
        .catch((err) => console.log(err));
      await axios
        .get(process.env.VUE_APP_MANAGER_ENDPOINT + "/api/members/" + this.id)
        .then((res) => (manager = res.data))
        .catch((err) => console.log(err));
    
   

      this.elecPrice = market.price.toFixed(2);
      this.production = manager.current.toFixed(2);
      this.elecDemand = market.stats.totalDemand.toFixed(2);
      this.maxProduction = manager.maxProduction;
      this.income = this.production * this.elecPrice;
      this.income = this.income.toFixed(2);
      this.totalAvailable = market.stats.totalProduction;
    },
  },
};
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
  .largeScreen {
    display: none;
  }
  .smallScreen {
    display: block;
  }
  td {
    width: 350px;
    padding: 5px;
  }
}
</style>
