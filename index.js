import {HttpServer} from '@node-wot/binding-http';
import {Servient} from '@node-wot/core';
import {WotHvac} from '/dist/base';

let httpServer = new HttpServer({port: 8080});
let servient = new Servient();
servient.addServer(httpServer);

servient.start().then(async (WoT) => {
    let hvac = new WotHvac(WoT, require('wothvac.model.json'));
});
