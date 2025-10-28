# Irish Rail REST API
*One boredly made project later, and there's a working REST API; who knew boredom could make such helpful things.* - TheWiredDiabetic himself.

## Stack
- Swagger UI (Documentation)
- Express.js (Barebones)
- fast-xml-parser (XML Convertor)
- A ton of dedication 
- YAMLjs (YAML Convertor)

## What's included in Version 1?
In the first build (version 1), there's a lot of useful tools; such as route determination.

**🧐 ROUTE DETERMINATION**\
A simple five liner piece of JavaScript that compares a train's origin and destination to a static JSON file to get what route it's operating. As per fact checking, it's mostly accurate - as Irish Rail tends to switch between InterCity & Commuter for some routes on certain days and times.

**⚙ SWAGGER DOCUMENTATIION**\
A useful tool for those looking to experiment with the REST API with response models, enums and pretty much everything. You can find the documentation page on ``/docs`` where you can view every endpoint avaliable.

**📡 NEARBY DETECTION**\
An endpoint built from front to back that uses a user's location (latitude and longtiude) to detect stations & trains within a 7.5 km radius.
(NOT YET IMPLEMENTED!!)

## How does it work?
Simply enough, a async request calls ``api.irishrail.ie``, whether it be ``getCurrentTrainsXML`` to fetch data. Once the data is passed back, it's run through an XML parser to be converted to JSON format then complied into a simplifed array and returned in a response back to the client.

## Will there be future updates?
At this momement, most likely - if there's any suitable features or fixes that could be added. Then most likely, it'll come in a future update.

## How do I report an issue?
If you come across an issue with the API, whether it be a broken endpoint. Simply, head over to **Issues** and create a new issue, ensuring you describe the following:

- what the issue is;
- how can this issue be reproduced (what steps?)
- if applicable, any console logs or additional debug information.

## Can I host my own version of this?
Absolutely, you're welcome to fork or clone this repository to your own machines for your own use cases. This project runs entirely on Node.js, therefore you'll need Node.js installed.

Simply run the following commands:
```
git clone https://github.com/TheWiredDiabetic/Irish-Rail-REST-API ie-rest-api
cd ie-rest-api
npm install
npm run dev
```

..and viola - that's everything!