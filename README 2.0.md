#WDI-PROJECT-2

##Brief

We were asked to use an external web api merged with the google maps javascript api to create a map based single page web application.

As an MVP, the app needed to be served by our own node.js express web server, allow user authentication via JSON web tokens, bcrypt and our own web api linked via mongoose to a mongo database and plot the data gained from the external web API of our choice onto a google map via the google maps api's markers.

##Toy-Tube-Map

After considering a few ideas, I decided to try and build my own version of a live tube map, where animated tube carriages would be visible to the user in near real time - informed by TFL's Unified API.

I initially considered mapping and animating all of London's tube carriages simultaneously however decided it to be beyond the scope of the project and almost definitely beyond my current ability. Instead I decided the user would have to add their own trains to the map one by one by first selecting the line and then an origin and destination station. The trains would then depart in near real time using information from TFL's unified API.

##Screenshots

Landing page
<img width="1269" alt="screen shot 2017-02-06 at 09 54 06" src="https://cloud.githubusercontent.com/assets/20629455/22642530/fd69de92-ec52-11e6-8613-86a0708411ac.png">
Login
<img width="1269" alt="screen shot 2017-02-06 at 09 56 54" src="https://cloud.githubusercontent.com/assets/20629455/22642534/fd6b482c-ec52-11e6-95da-b22e0f018a4b.png">
Register
<img width="1269" alt="screen shot 2017-02-06 at 09 58 03" src="https://cloud.githubusercontent.com/assets/20629455/22642535/fd6eb2fa-ec52-11e6-9fca-89c8b3f0f227.png">
Form to add new train to map
<img width="1269" alt="screen shot 2017-02-06 at 09 54 33" src="https://cloud.githubusercontent.com/assets/20629455/22642533/fd6afbec-ec52-11e6-97ec-900f49cd3924.png">
First train departed, others awaiting departure.
<img width="1269" alt="screen shot 2017-02-06 at 09 56 41" src="https://cloud.githubusercontent.com/assets/20629455/22642532/fd6a5732-ec52-11e6-826c-8ea73084dcb1.png">
Tube carriages moving along their lines
<img width="1269" alt="screen shot 2017-02-06 at 09 58 18" src="https://cloud.githubusercontent.com/assets/20629455/22642531/fd69f9ea-ec52-11e6-82a9-534cf1958169.png">


##Control Flow

- The user is first presented with the tube logo superimpossed over a full screen google map centred over central London.

##Challanges

##Wins

##Known issues to be addressed

##Features which could be added

##Technologies Used

As this project was a culmination of almost everything I covered during the GA WDI course before the start of the project I thought it useful to state broadly state the technologies and methods used for this project. 

###Back-end

Node.js, Express, Gulp, Mongo, Mongoose, JSON web tokens, bcrypt, ES6. 

###Front-end

JavaScript, HTML, CSS, SCSS, Object Orientation, AJAX request, Google Maps JavaScript API, TFL Unified API, User Authentication.


# WDI_PROJECT_2
My second General Assembly Web Development Immersive project


##To Investigate
###Data Usage
- What data is available and how should it be used?
- timeToStation can be used as departure time (would also move things 'forward in time to catch up with real life'.
- When a station is clicked a request can be made.  icon released from station after set timeout equal to timeToStation.
- Can trains be uniquely identified from running times?
- Maybe forget animation for now.  Plot symbol with number along line every time it updates!!!!!!!!

##MVP
user can click on station to see incoming trains.  Positions will update each time a push notification is received from the hub.

user can click release train from...
will animate based on time to destination across all stations.

###Hows?
- how to convert curentLocation to offset on map
- get stations from route info
- get meters between from route info
- potentially on one route can set way points at each station 
- need to catalogue each station on line into a percentage / meters of line.
- this is all static info

##Nice to have
some sort of animation smoothing

##Side project
animate one icon along each line with varying speeds
different skins

##Dev Diary
###Tuesday 10
- explored google api
- direction services
- icons
- symbols
- animation
- offset
- manually inputting percentages
- switching to meters

###Wednesday 11
- messed around for ages trying to find best data
- looked at socketing with hub
- decided to just plot trains via arrival boards on a map
- proxy requests server side code
- spent ages figuring out tfl's api and what it could do 
- no unique identifier for tubes


###Thursday 12
- google doesnt provide the timings available from their own route planner on their api
- refactored code
- using callbacks to make sure subsequent api requests were returned before code continued running
- got timing working
- got delay working
- tried using common names instead of lat lng for google direction request but buggy data
- tried using google departure times but buggy data
- supplemented google route and duration data with tfl journey planner (stops along the way) and arrival times.

###Friday 13
- dev diary
- wire frame
- refactored server side code into appropriate routes and controllers
- refactored tube station object building from client side through to server side
- difficult as request to tfl for tube stations returns 5000+ stations due to multiple entrances
- needed to 2 requests inside one another before manipulating the data and saving my own database to get around this
- set up own api routes to return this information.
- how to deal with end of line departures? judge end of line, if end of line get next stations arrival info.

###Satruday 14

- how to deal with bad responses from off? if function on property of response, if response isnt whats expected then return set time out of a repeat of the function.  see end of line departure.
- how to deal with no responses mid way? same as above, if response is 'no trains in right direction' then wait 5 secs and make another request.
- how to construct ui? line then origin then destination. required a reconstruction of tubemap db and reconstruction of stopPoints object into an array with tube line and tube id present for each stop point. code to find all vicotria id and names make array then merge togeather into array
- need to nest ajax in ajax in ajax for journey array, route and init next section to work sequentially
- fixed sequential animation overrun with if statement
- tfl data inconsistencies making it very dificult e.g. not including departure stoppoints in route response. lots of legs for things like walking.
- ISSUE: by requesting for each sectino it is enevitable that some walking will be involed / buggy behavior of polylines.  If one poly line was sued would reduce the risk of bugs.  could use meters to animate icon along line and google estimates of distance between stations? cant be done as meters would include walking and stairs.  google dont provide information for between stations on longer routes.

###Sunday
- splitting app into App, Map and Train constructor functions. Hopefully will allow new trains to be constructed on user input.
- getting this inside callbacks = self

###Monday

- css side bar passing colors of train lines
- mutliple sliders
- user authentication from scratch 
- user register, no password (smashed it)
- real understanding of client side ajax request callbacks.
- done authentication including back end api requests, routes, controllers, schema, password hashing, password confirmation, tokens, front end tokens, logged in logged out states.

###Tuesday
- refactoring css and classes link an absolute legend.  feels great.
- authentication and menu functionality and styling
- re-writing seeds logic to account for stoppoints having more than one line setTimeout, promises, schema, model
- trying to plug in tfl departure data
- got journey stoppoints array
- figuring out logic to filter arrivals in right direction
- smashing 'this' and callbacks - see train init and get journey stoppoints array functions.
- smahinf this and callbacks, see control flow of train now with tfl departure info
- if blank then recheck logic
- spent ages trying to slow down trains.  was due to tubeMap.animatino rate
- added awaiting departure message and removal off old trains
- fixed registration

###Future
- github links etc
- tidy files