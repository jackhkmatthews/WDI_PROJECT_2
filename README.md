![ga](https://cloud.githubusercontent.com/assets/20629455/23824362/2c9817c2-066d-11e7-8988-7b1eefc6d628.jpg)
![wdi](https://cloud.githubusercontent.com/assets/20629455/23824363/2ddeaa7e-066d-11e7-8630-f7c890c9f1c1.png)

___
<br>

# GA WDI24 Project 2 - [Toy Tube Map](https://tube-map.herokuapp.com/)

## Local Setup

1. Clone or download the repository and navigate to it's root in terminal.
2. run `npm i`, `mongod`, `node db/seeds.js` and `gulp`.
3. Navigate to [http://localhost:7000](http://localhost:7000/).

## Technologies Used

### Back-end

Node.js, Express.js, JSON web tokens, Bcrypt, Mongoose, MongoDB, Google Maps JavaScript API, TFL Unified API, gulp.js.

### Front-end

JavaScript, jQuery, HTML, CSS, SCSS.

## Brief

We were challenged to use an external Web API merged with the Google Maps JavaScript API to create a map based Single Page Application.

As an MVP, the app needed to:

- Be served by our own Express.js web server.
- Allow user authentication via JSON Web Tokens, Bcrypt and our own Web API linked via Mongoose to a MongoDB database.
- Plot the data gained from the external Web API of our choice onto a Google map via the Google Maps API's markers.

	

## Overview

After considering a few ideas, I decided to try and build my own version of a live tube map, where animated tube carriages would be visible to the user in near real time - informed by TFL's Unified API.

I initially considered mapping and animating all of London's tube carriages simultaneously however decided it to be beyond the scope of the project and almost definitely beyond my current ability. Instead the user would add their own trains to the map by selecting line, origin and destination. The trains would then depart in near real time using information from TFL's unified API.

## Screenshots

### Tube carriages moving along their lines

<img width="1269" alt="screen shot 2017-02-06 at 09 58 18" src="https://cloud.githubusercontent.com/assets/20629455/22642531/fd69f9ea-ec52-11e6-82a9-534cf1958169.png">

### Landing page

<img width="1269" alt="screen shot 2017-02-06 at 09 54 06" src="https://cloud.githubusercontent.com/assets/20629455/22642530/fd69de92-ec52-11e6-8613-86a0708411ac.png">

### Login

<img width="1269" alt="screen shot 2017-02-06 at 09 56 54" src="https://cloud.githubusercontent.com/assets/20629455/22642534/fd6b482c-ec52-11e6-95da-b22e0f018a4b.png">

### Register

<img width="1269" alt="screen shot 2017-02-06 at 09 58 03" src="https://cloud.githubusercontent.com/assets/20629455/22642535/fd6eb2fa-ec52-11e6-9fca-89c8b3f0f227.png">

### Form to add new train to map

<img width="1269" alt="screen shot 2017-02-06 at 09 54 33" src="https://cloud.githubusercontent.com/assets/20629455/22642533/fd6afbec-ec52-11e6-97ec-900f49cd3924.png">

### First train departed, others awaiting departure.

<img width="1269" alt="screen shot 2017-02-06 at 09 56 41" src="https://cloud.githubusercontent.com/assets/20629455/22642532/fd6a5732-ec52-11e6-826c-8ea73084dcb1.png">

## Mechanics

### On Submission of Journey

1. The User selects line, origin and destination.
2. On submission of the above a new train object is created on the App object. This train object is completely autonomous from the main control flow of the App and has the intelligence to get all the information it requires to navigate itself to it's destination at the correct speed and at the correct departure time.
3. This new train object sends a request to Google Map's Journey Planner and receives route line and duration.
4. Other train features (colour of messages, carriage and line) are taken from hard coded arrays related to the line names.
5. The train makes a request to TFL via my own API asking for the arrival information for the first station (other than the origin) along the journey. This arrival information is then used to determine if a train should be release from the origin station or not.
6. If no such confirmation is received (i.e according to TFL there are currently no trains departing the origin station) the carriage and awaiting departure board will remain.
7. These requests are made every 15 seconds until a train can be released.

### On Release of train

1. The awaiting departure sign is removed.
2. The train already knows it's duration from the initial Google Maps Journey Planner request. The train also has a formula to work out how far along it's Google Maps Polyline it should move, per animation frame, based on that duration.
3. The train will now move along its line at the speed which will get it to its destination in line with Google Maps Journey Planner duration estimate.

### On Tain Arrival

1. The train and it's line and messages are removed from the screen.

## Challenges

The biggest challenge was, given the wealth of information available through Google and TFL APIs, extracting the useful pieces of information and then manipulating them to fit their purpose.

For example, TFL do no provide departure information for their tube stations, only arrival information. This meant that if I wanted to know the _departure_ information for a specific station I would need to analyse the arrival information for the stations either side of it.

## Favourite Bits

I enjoyed creating the Train constructor function which allows all trains created by the user to operate autonomously from the main control flow. This included regulating speed, direction and making AJAX requests if and when they are needed.

I am also please with the styling of the landing page logo and the app's menus which were made to look like a TFL product.

## Known Issues To Be Addressed

1. Further intelligence needs to be built into the departure sensing function to prevent some train departures being missed.
2. When the user navigates away from the page the app pauses meaning the trains are no longer traveling in estimated real time.

## Features Which Could Be Added

1. User profiles and saved trains.
2. On logout the maps and departure board should reset.
3. Plot all London trains immediately as opposed to one by one.
4. A departure countdown timer.
