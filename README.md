# M7011E_AJ

### Introduction
We are two students who work on the course "Design of dynamic web systems" in LTU designated M7011E.

### The Project
The course work is about simulating a small scaled electricity market. Three kind of actors are to be taken in account in the similation:
* Consumers: these houses consume electricity from the market 
* Prosumers: these houses produce energy thanks to there own a little wind turbine. The inhabitants can store this energy in a battery and use it for there own consumption. They can sell the leftover to the market. They can also buy electricity from market if there wind turbine is not sufficient.
* Manager: there is one manager for the whole electrical grid. It produces electricity thanks to a coal plant, and manages the market.

### Our Design
For optimization of the app, consumers will be in consumer groups (organized in clusters), and we will take in account the total consumption only, and we will not simulate it for the front-end.
We are going to take real time wind pressure.
