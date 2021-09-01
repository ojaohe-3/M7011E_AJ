import { Types } from "mongoose";
import { DB } from "../DB-Connector/db-connector";
import { IComponent } from "./node";
import { Weather } from "../weather";
import { assert } from "console";
import DefaultNode from "./defaultnode";
import DataMonitor from "../handlers/DataMonitor";

export class Consumer extends DefaultNode {
  timefn: number[];
  consumption: (temp: number) => number;
  profile: number;
  
  constructor(id: string, timefn: number[], demand?: number, profile?: number) {
    super();
    this.id = id;
    assert(timefn.length == 24);
    this.timefn = timefn;
    this.output = 0;
    this.asset = "consumer";

    if (!profile) {
      // generate a normal distrobution value on size of household, with accomplacing constant that determine the rate of consumption,
      // Larger profile value means it consumes more... multiplicative with weather conditions.
      const r = Math.random();
      const rd = Math.random();
      // size is the number of individuals in a house hold as a real number, it is 2.7% weighted,
      const size = r * 4 - r * 2 + rd * 2 + 4;
      // lamba is the variability of the the consumer to consume, this is much more weighted but tends to be a lower value.
      const lamba = r - r / 2 + rd / 2 + 1;
      // the weights has been predetermined from offical consumption statistics, the lamba is a rough estimate of non consumption including non households
      this.profile = size * 0.027 + lamba * 0.5;
    } else this.profile = profile;

    this.consumption = (temp) => {
      // The tempreture x in celsius, profile p, profile at time stamp tf:
      // p * ((21 - x)^2 + tf) + 1
      // tempreture in our case is in kelvin this 294.15 is 21 celsius
      return (
        this.profile * (0.002 * Math.pow(294.15 - temp, 2)) +
        timefn[new Date().getHours()] +
        1
      );
    };
    this.demand = demand ? demand : 0;
    this.tick = (time: number) => {
      this.demand = this.consumption(Weather.Instance.temp);
      if (this.timeToMonitor < time) {
        this.timeToMonitor = time + 10000;
        DataMonitor.instance.status(this as IComponent);
      }
    };
  }

  async document() {
    try {
      const body = {
        demand: this.demand,
        timefn: this.timefn,
        profile: this.profile,
        name: process.env.NAME,
      };
      await DB.Models.Consumer!.findByIdAndUpdate(this.id, body, {
        upsert: true,
      }).exec();
    } catch (error) {
      console.log(error);
    }
  }

  static generateTimeFn(): number[] {
    const random = Math.random();
    return [
      0.02 * random,
      0.0114 * random,
      0.011 * random,
      0.05 * random,
      0.2 * random,
      0.35 * random,
      0.6 * random,
      0.8 * random,
      0.65 * random,
      0.64 * random,
      0.56 * random,
      0.58 * random,
      0.74 * random,
      0.56 * random,
      0.3 * random,
      0.2 * random,
      0.812 * random,
      0.911 * random,
      0.922 * random,
      0.926 * random,
      0.845 * random,
      0.76 * random,
      0.311 * random,
      0.121 * random,
    ]; // profile for each hour of the day
  }
}
