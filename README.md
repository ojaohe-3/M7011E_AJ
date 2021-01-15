# M7011E_AJ

### Introduction
We are two students who work on the course "Design of Dynamic Web Systems" (M7011E) in LTU.

### The Project
The course work is about simulating a small scaled electricity market. Three kind of actors are to be taken in account in the simulation:
* Consumers: these houses consume electricity from the market.
* Prosumers: these houses produce energy thanks to there own a little wind turbine. The inhabitants can store this energy in a battery and use it for there own consumption. They can sell the leftover to the market. They can also buy electricity from market if their wind turbine is not sufficient.
* Manager: there is one manager for the whole electrical grid. It produces electricity thanks to a coal plant, and manages the market. He fixes the price of electricity, buys electricity from prosumers, provides energy to every consumer/prosumer demanding, and fixes the amount of electricity produced per hour.

### Our Design
For optimization of the app, consumers will be in consumer groups (organized in clusters), and we will take in account the total consumption only, and we will not simulate it for the front-end.

We are going to take real time wind pressure.

There is going to be only one type of small wind turbine (WT). It can be multiple WT per prosumer.

In the graph, manager has an energy production, a real time price and a carbon emission.

The prosumer has to know if he is currently consuming from his battery (so his own energy) or from the market.

### Documentation
All services, exluding the front-end uses typscript Express modules handle request in its api. Currently only put, get and post is supported for most api calls.
#### Services
* Authentication Service
  Takes a User ID (called client_id) and fetches the user profile from mongoDB server, see the User schema for modules  for that id. 
  The id should be tied to its user id in your OpenID scheme. Needs to be deployed with a DB_CONNECT env for connecting to the MongoDB. 
  This is a fairly simple service, it can be fragmented and really do not care, it will simply validate a token and return user data, that describes its privilages to the over all service
*  Manager Service
  Manager is simulation a powerplant manager. the ManagerHandler singelton object, fetches from the mongoDB instance via its service name for each partirtion lanuched. The database name propery is indication to which service it is tied to, This will not fragment into multiple services there for all instances that is launch of this service should have set there env variable name NAME to something unique.
  ManagerHandler stores all Manager Objects in a hashmap, it can call them, get them all as an array, and you can update and add an entry in which it update the simulation and database, or fetch via its id. This singleton instance is then used by express api to manipulate each object(s).
 
  
  Manager Object is defined only by its maximum power output.
  ```js
  export default class Manager{
    
    id: String;
    current: number;
    maxProduciton: number;
    status: boolean;
    ratio: number;
    tick: () => Promise<void>;

  ```
  The current property is the output of the simulated reactor. The tick method, is asyncronus as it updates the database, aswell as the simulation service via api calls. the tick updates all values and runs every second for each object. When deployed, they will all fire in unison, this is not very optimal.
  * Market Service
    This api gathers all connected simulation services, gather the total demand vs supply and calculates its price
  * Prosumer Service
    Unaptly named procumer, manages much like manager, in many ways almost identical, however. It cannot dictade what it produces. The production can be stored in batteries
    
   * Simulation service
   * Weather-Module
   * Vue-interface
#### API
  * Authentication API
    
  * Manager API
  
  * Prosumer API
  
  * Market API
  
  * Simulator API
#### Modules

* DB-Connector
* Weather Modules
* Members
* Control
* Data
* Price
