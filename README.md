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
    This api gathers all connected simulation services, gather the total demand vs supply and calculates its price.
    Its members are called cell objects, they keep track of an simulation endpoint and continuly fetches from its api to keep up to date.
    
  * Prosumer Service
    Unaptly named procumer, manages much like manager, in many ways almost identical, however. It cannot dictade what it produces, it can disable but is dictaded by wind speed for its location. The production can be stored in batteries and is controlled.  
    
   * Simulation service
   Simulation is what keeps track of all prosumers, it recives from the other apis calls to store current data on production. The idea is it will scale to multiple instances, but for now one is to be deployed. The simulation keeps a datastack for all members in the manager and prosumer services, that they publish and update on the simulation. The simulation do not care about simulating it only calculate the current usage and current production for all services. Meaning it will keep having output even if connected services goes down. Though they can contribute at anypoint.
   
   * Weather-Module
    Keeps track on weather through https://openweathermap.org/api
    
   * Vue-interface
   A Vue interface, a landing page for the entire site. it calls the backend apis and keeps track of your dashboard. Currently not finished. Requires it to connect to your openid issuer.

#### API
  General pricinple is that all calls, is its prefix /api/ followed to what module you want the data from. 
  for example to get the members of a service /api/members, it would respond to all available object members.
  For reference ``` <variableName>? ``` indicates its optional.
  * Authentication API
      * ``` GET ``` /api/login
      supports post and get
      respons:
      ```json
      {
          "username" : string,
          "clientid" : string,
          "managers?" : Array<privilage>,
          "prosumers?" : Array<privilage>,
          "consumers?" : Array<string>,
          "last_login" : Date,
    }
      ```
      where **privilage** is an js object of the following format:
      ```json
      {
        "level" : number,
        "access?" : string,
        "id" : string
      }
      ```
      Currently no token is required, but will in the future
      
      * ``` POST ``` /api/login
        disabled during production, post a body with format:
        ```json
        {
          "username" : String,
          "clientid" : String,
          "managers?" : Array<privilage>,
          "prosumers?" : Array<privilage>,
          "consumers?" : Array<string>,
          "last_login" : Date,
        }
       ``` 
      and it will publish this user on the database. 
      Currently no token is required, but will in the future
      
  * Manager API 
    * ``` GET ``` /api/members/
      gets all manager objects as an array
      response format:
      ```json
        {
          "body": [
            {
              "id" : String
              "current" : number
              "maxProduciton" :	number
              "status" :	boolen
              "ratio" :	number
            }
            ...
          ]
        }
      ```
    * ``` POST ``` /api/members/
      post a single member, will update the registed simulation service as well as the database
      payload format:
      ```js
      {
        "id?" : string,
        "maxProduction" : number
      }
      ```
     * ``` GET ``` /api/members/<id>
      get specific member with id in the url.
      respons format:
      ```json
      {
        "id" : String
        "current" : number
        "maxProduciton" :	number
        "status" :	boolen
        "ratio" :	number
      }
      ```
    * ``` GET ``` /api/control/<id>
      control interface, get current controls of a manager
      respons format:
      ```json
      {
        "ratio?" : number,
        "status?" : boolean
      }
      ```
     * ``` POST ``` /api/control/<id>
      Changes current production ration, and or deactivates the process.
      required payload format:
      ```json
      {
        "ratio?" : number,
        "status?" : boolean
      }
      ```
  * Prosumer API
    * ``` GET ``` /api/members/
      gets all members. Format:
      ```json
	    {
	      [
          {
          "turbines": [number],
          "batteries": [ {
            "capacity": number,
            "maxOutput": number,
            "maxCharge": number,
            "current?": number,
              },
            "_id?": String
          }
		    ...
	     ],
      }
      ```
      The number for turbine is the max poweroutput it can produce.

    
    * ``` GET ``` /api/members/<id>
	get individual prosumer object with id
	format:
	```json
		{
		"turbines": [number],
		"batteries": [ {
			"capacity": number,
			"maxOutput": number,
			"maxCharge": number,
			"current?": number,
		    },
		...
		],
		 "_id?": String,
		}
       ```
    * ``` POST ``` /api/members/
	Post a new prosumer to be published in the simulation service and database, format for the payload:
	```json
      	{
	"turbines": [number],
	"batteries": [ {
		"capacity": number,
		"maxOutput": number,
		"maxCharge": number,
		"current?": number,
	    },
	...
	],
	 "_id?": String,
	}
       ```
    * ``` PUT ``` /api/members/<id>
	updates an entry by the id.
	the payload required format:
	```json
      	{
	"turbines": [number],
	"batteries": [ {
		"capacity": number,
		"maxOutput": number,
		"maxCharge": number,
		"current?": number,
	    },
	...
	]
	}
       ```
    * ``` GET ``` /api/control/<id>
	Gets the control from member with <id>. 
	format:
	```json
	{
		"input_ratio": number,
        	"output_ratio": number,
        	"status": boolean,
	}
	```
    * ``` PUT ``` /api/control/<id>
	updates the control from member with <id> in the url. 
	format:
	```json
	{
		"input_ratio": number,
        	"output_ratio": number,
        	"status": boolean,
	}
	```
  
  * Market API
    * ``` GET ``` /api/members/
       Gets all cell objects,
       respons format:
       ```json
          {
            [
            "destination" : string,
            ...
            ]
          }
       ```
       
    * ``` POST ``` /api/members/
      post a new cell instance that will update the database,
      the destination should point to an actual service as it does not validate them concurrently.
      required format
      ```json
          {
            "body": [
              "destination" : string
            
          }
       ```
    * ``` GET ``` /api/members/<id>
      Get individual cell,
      format:
      ```json
          {
            "destination" : string,
          }
       ```
  
    * ``` GET ``` /api/price/
      fetch te calculated price and sampled aggregated data of the entire simulation.
      Format:
      ```json
          {
            "price" : number,
            "stats" : {
              "totalDemand" : number,
              "totalProduciton : number
            }
          }
       ```
    
  * Simulator API
  	* ``` GET ``` /api/members/
		Gets all members
		Format:
		```json
		{
			"consumers": [Consumer]
			"prosumers": [Prosumer]
			"managers": [Manager]
		}
		```
		The format of consumer is 
		```json
		{
			"id": String,
			"timefn": [number],
			"demand" : number,
			"profile": number,
		}
		```
		note that timefn requires an 24 length array of numbers between 0-1
		For Prosumer members:
		```json
		{
			"id": String,
			"totalProduction": number,
			"totalCapacity": number,
			"currentCapacity": number,
			"name?": String,
			"status": boolean,
		}
		```
		Managers
		```json
		{
			"id" : String,
			"current" :number,
			"maxProduction" :number,
			"status": boolean,
			"name?": String,
		}
		```
		
		
	* ``` GET ``` /api/data/
		Gets the summation of all data
		```json
		{
			"totalProduction" : number,
			"totalDemand" :number
			
		}
		```
	* ``` GET ``` /api/members/consumers/
		gets all consumers members
		```json
		{
		   [
			"id": String,
			"timefn": [number],
			"demand" : number,
			"profile": number,
		    ]
		}
		```
	* ``` GET ``` /api/members/consumers/<id>
		get consumer member of ID, see the /api/members on how each consumer is constructed
	
	
	* ``` POST ``` /api/members/consumers/
		publish a new consumer,
		Required format:
		```json
		{
		   "body": [
			"id?": String,
			"timefn": [number]
		    ]
		}
		```
		note timefn have to be length of 24, one for each hour. A optin to include **profile** variable is missing in currently.
	* ``` GET ``` /api/members/prosumers/
		gets all members of they type prosumers
		format:
		```json
		{
		    [
			"id": String,
			"totalProduction": number,
			"totalCapacity": number,
			"currentCapacity": number,
			"name?": String,
			"status": boolean,
		    ]
		}
		```
	* ``` POST ``` /api/members/prosumers/
		Add new members of the prosumer type, also on the side updates or creates a new consumer entry.
		Require payload format:
		```json
		{
		    "body" : [
			"id": String,
			"totalProduction": number,
			"totalCapacity": number,
			"currentCapacity": number,
			"name?": String,
			"status": boolean,
		    ]
		}
		```
	
	* ``` GET ``` /api/members/prosumers/<id>
	gets specific prosumer.
	```json
		{
		    
			"id": String,
			"totalProduction": number,
			"totalCapacity": number,
			"currentCapacity": number,
			"name?": String,
			"status": boolean,
		    
		}
		```
	
	* ``` PUT ``` /api/members/prosumers/<id>
	updates specific memebers data.
	```json
		{
		    
			"id": String,
			"totalProduction": number,
			"totalCapacity": number,
			"currentCapacity": number,
			"name?": String,
			"status": boolean,
		    
		}
		```
	
	* ``` GET ``` /api/members/managers/
	Gets all members of the type manager.
	```json
		{
		   [
			"id" : String,
			"current" :number,
			"maxProduction" :number,
			"status": boolean,
			"name?": String,
		    ]
		}
	```
	* ``` POST ``` /api/members/managers/
	Creates new members for the service.
	Required format of the payload.
	```json
		{
		   "body" : [
			"id" : String,
			"current" :number,
			"maxProduction" :number,
			"status": boolean,
			"name?": String,
		    ]
		}
	```
	* ``` GET ``` /api/members/managers/<id>
	Get specific memeber
	```json
		{
			"id" : String,
			"current" :number,
			"maxProduction" :number,
			"status": boolean,
			"name?": String,
		}
		```
	* ``` PUT ``` /api/members/managers/<id>
	Updates Specific member
	```json
		{
			"id" : String,
			"current" :number,
			"maxProduction" :number,
			"status": boolean,
			"name?": String,
		}
		```
	
		
  
#### Modules

* DB-Connector
* Weather Modules
* Members
* Control
* Data
* Price

