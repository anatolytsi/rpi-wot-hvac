import '@node-wot/core';
import {Hvac} from "./hvac";

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
            this.hvac.mode = mode;
        });
        this.thing.setPropertyReadHandler('temperatureFeed', async () => {
            return this.hvac.temperatureFeed;
        });
        this.thing.setPropertyWriteHandler('temperatureFeed', async (temp) => {
            this.hvac.temperatureFeed = temp;
        });
        this.thing.setPropertyReadHandler('temperatureInside', async () => {
            // return await this.hvac.temperatureInside.readTemperature();
            return 123;
        });
        this.thing.setPropertyReadHandler('temperatureOutside', async () => {
            // return await this.hvac.temperatureOutside.readTemperature();
            return 123;
        });
        this.thing.setPropertyReadHandler('temperatureHe1', async () => {
            return await this.hvac.temperatureHe1.readTemperature();
        });
        this.thing.setPropertyReadHandler('temperatureHe2', async () => {
            return await this.hvac.temperatureHe2.readTemperature();
        });
        this.thing.setPropertyReadHandler('temperatureHe3', async () => {
           return await this.hvac.temperatureHe3.readTemperature();
        });
        this.thing.setPropertyReadHandler('valveOpened1', async () => {
            return this.hvac.valve1.isOpened();
        });
        this.thing.setPropertyReadHandler('valveOpened2', async () => {
            return this.hvac.valve2.isOpened();
        });
        this.thing.setPropertyReadHandler('valveOpened3', async () => {
            return this.hvac.valve3.isOpened();
        });
        this.thing.setPropertyReadHandler('valveOpened4', async () => {
            return this.hvac.valve4.isOpened();
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
