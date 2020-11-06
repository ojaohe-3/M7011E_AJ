# M7011E_AJ

### Introduction
We are two students who work on the course "Design of dynamic web systems" in LTU designated M7011E.

### The Project
The course work is about simulating a small scaled electricity market. Three kind of actors are to be taken in account in the similation:
* Consumers: these houses consume electricity from the market.
* Prosumers: these houses produce energy thanks to there own a little wind turbine. The inhabitants can store this energy in a battery and use it for there own consumption. They can sell the leftover to the market. They can also buy electricity from market if there wind turbine is not sufficient.
* Manager: there is one manager for the whole electrical grid. It produces electricity thanks to a coal plant, and manages the market. He fixes the price of electricity, buys electricity from prosumers, provides energy to every consumer/prosumer demanding, and fixes the amount of electricity produced per hour.

### Our Design
For optimization of the app, consumers will be in consumer groups (organized in clusters), and we will take in account the total consumption only, and we will not simulate it for the front-end.
We are going to take real time wind pressure.
There is going to be only one type of small wind turbine (WT). It can be multiple WT per prosumer.
In the graph, manager has an energy production, a real time price and a carbon emission.
