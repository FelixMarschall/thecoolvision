# TheCoolVision

## Project

 This project is part of a university course Alltagsautomaiserung. The goal is to create a vision system that can be used to track the inventory of a fridge. Our goal for the project was to make it as user friendly as possible to interact with.

- Aaron Kreis
- Felix Marschall
- Moritz Spohn

Supervised by Fabian Rybinski.

## Architecture

<img src="doc/img/architecture.svg">

## Frontend

## Backend

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

To install TheCoolVision as addon, you need to this link

https://github.com/FelixMarschall/HA_GrocyTablet

as a add on repo. Or click on the link and use the blue button. 

### Configure

You need to pass a Grocy token, OpenAI token and the Grocy instance URL to configure.

HomeAssistant --> Addons --> TheCoolVision

Choose the tab ```configuration``` and insert the parameters into it. 

Within the context of the Everyday Automation internship, the following individuals contributed:

- Aaron Kreis
- Felix Marschall
- Moritz Spohn

They were supervised by Fabian Rybinski.

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
