# TheCoolVision

## Project

 This project is part of a university course Alltagsautomatisierung. The goal is to create a vision system that can be used to track the inventory of a fridge. Our goal for the project was to make it as user friendly as possible to interact with.

- Aaron Kreis
- Felix Marschall
- Moritz Spohn

Supervised by Fabian Rybinski.

## Architecture

<img src="doc/img/architecture.svg">

HomeAssistant is the platform to host our addon and homeassistant.
Grocy stores data and has features e.g. an app with QR-Code Scanner. OpenAI is used for food image recognition.

The peripheral device needs to have a camera and internet browser to access the homeassistant instance. 

## Grocy

An Grocy instance is needed. Choose between:

1. HomeAssistant Addon https://github.com/hassio-addons/addon-grocy
2. Official https://grocy.info/de
3. Docker and more https://grocy.info/addons

### Generate Access Token

TheCoolVision needs a token to access Grocy data.

1. <img src="doc/img/grocy_sett_1.png" alt="Grocy Menu" height="40%">
2. Right corner ```Add``` new token
3. copy generated token (only once copyable)

## Install our App on Home Assistant

[![Add to Home Assistant](https://my.home-assistant.io/badges/supervisor_add_addon_repository.svg)](https://my.home-assistant.io/redirect/supervisor_add_addon_repository/?repository_url=https%3A%2F%2Fgithub.com%2FFelixMarschall%2FTheCoolVision_HA_Addon)

Second Option:

To install TheCoolVision as addon, you need to this link
https://github.com/FelixMarschall/TheCoolVision_HA_Addon
as a add on repo.

In Home Assistant go to ```Settings -> Addons -> Add-on store``` and search for ```TheCoolVision - Grocy Tablet Interaction```
### Configure

#### Please modify with your configuration

![Addon Config](doc/img/addon_config.png)

You need to pass a Grocy token, OpenAI token and the Grocy instance URL to configure.

## Installation on Server
It's possible to run this app without HomeAssistant.

Use the docker file in this repo to build and run the flask app

1. change directory to the folder where this file is.
2. Buildllation on Server
It's possible to run this app without HomeAssistant.

Use the docker file in this repo to build and run the flask app

1. change directory to the folder where this file is.
2. Build
``` 
docker build -t coolvision-app .
```

3. Run
``` 
docker run -p 5000:5000 coolvision-app
```

4. open http://172.21.80.246:5000


## Limitations
### Necessary SSL certificate
Accessing the webcam via a browser requires an valid https connection. Means, the TheCoolVision app must be hosted with a valid ssl certificate (when installed as an addon -> the homeassistance instance)

## Add User Buttons

1. Create new user in Grocy ```Setting icon > Manage Users > Add```
2. Username is the displayed name on the button
3. save

