import '@node-wot/core';
import {Hvac} from './hvac';
import * as path from 'path';

require('dotenv').config({path: path.join(__dirname, '../', '.env')})

export class WotHvac {
    public thing!: WoT.ExposedThing;
    public td!: WoT.ThingDescription;
    private WoT: WoT.WoT;
    private hvac: Hvac;

    constructor(WoT: WoT.WoT, tm: any) {
        this.WoT = WoT;
        this.hvac = new Hvac();
        this.WoT.produce(tm).then(async (exposedThing: WoT.ExposedThing) => {
            this.thing = exposedThing;
            this.td = this.thing.getThingDescription();
            this.addPropertyHandlers();
            this.addActionHandlers();
            this.addEventHandlers();
            await this.thing.expose();
        })
    }

    private addPropertyHandlers() {
        this.thing.setPropertyReadHandler('mode', async () => {
            return this.hvac.mode;
        });
        this.thing.setPropertyWriteHandler('mode', async (mode) => {
            this.hvac.setMode(mode);
        });
        this.thing.setPropertyReadHandler('hysteresis', async () => {
            return this.hvac.hysteresis;
        });
        this.thing.setPropertyWriteHandler('hysteresis', async (hysteresis) => {
            this.hvac.hysteresis = hysteresis;
        });
        this.thing.setPropertyReadHandler('temperatureFeed', async () => {
            return this.hvac.temperatureFeed;
        });
        this.thing.setPropertyWriteHandler('temperatureFeed', async (temp) => {
            this.hvac.temperatureFeed = temp;
        });
        this.thing.setPropertyReadHandler('temperatureInside', async () => {
            return this.hvac.temperatureInside.temperature;
        });
        this.thing.setPropertyReadHandler('temperatureOutside', async () => {
            return this.hvac.temperatureOutside.temperature;
        });
        this.thing.setPropertyReadHandler('temperatureHe1', async () => {
            return this.hvac.temperatureHe1.temperature;
        });
        this.thing.setPropertyReadHandler('temperatureHe2', async () => {
            return this.hvac.temperatureHe2.temperature;
        });
        this.thing.setPropertyReadHandler('temperatureHe3', async () => {
            return this.hvac.temperatureHe3.temperature;
        });
        this.thing.setPropertyReadHandler('valveOpened1', async () => {
            return this.hvac.valve1.opened;
        });
        this.thing.setPropertyReadHandler('valveOpened2', async () => {
            return this.hvac.valve2.opened;
        });
        this.thing.setPropertyReadHandler('valveOpened3', async () => {
            return this.hvac.valve3.opened;
        });
        this.thing.setPropertyReadHandler('valveOpened4', async () => {
            return this.hvac.valve4.opened;
        });
    }

    private addActionHandlers() {
        this.thing.setActionHandler('openValve1', async () => {
            return this.hvac.valve1.open();
        });
        this.thing.setActionHandler('closeValve1', async () => {
            return this.hvac.valve1.close();
        });
        this.thing.setActionHandler('openValve2', async () => {
            return this.hvac.valve2.open();
        });
        this.thing.setActionHandler('closeValve2', async () => {
            return this.hvac.valve2.close();
        });
        this.thing.setActionHandler('openValve3', async () => {
            return this.hvac.valve3.open();
        });
        this.thing.setActionHandler('closeValve3', async () => {
            return this.hvac.valve3.close();
        });
        this.thing.setActionHandler('openValve4', async () => {
            return this.hvac.valve4.open();
        });
        this.thing.setActionHandler('closeValve4', async () => {
            return this.hvac.valve4.close();
        });
    }

    private addEventHandlers() {

    }
}
