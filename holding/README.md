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

-