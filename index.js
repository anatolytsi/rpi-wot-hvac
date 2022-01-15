const {HttpServer} = require('@node-wot/binding-http');
const {WebSocketServer} = require('@node-wot/binding-websockets');
const {Servient} = require('@node-wot/core');
const {WotHvac} = require('./dist/base');

let httpServer = new HttpServer({port: 8080});
let webSocketsServer = new WebSocketServer({port: 8081});
let servient = new Servient();
servient.addServer(httpServer);
servient.addServer(webSocketsServer);

servient.start().then(async (WoT) => {
    let hvac = new WotHvac(WoT, require('./wothvac.model.json'));
});
