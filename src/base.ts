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
        this.thing.setPropertyReadHandler('temperature1', async () => {
            return await this.hvac.t1.readTemperature();
        });
        this.thing.setPropertyReadHandler('temperature2', async () => {
            return await this.hvac.t2.readTemperature();
        });
        this.thing.setPropertyReadHandler('temperature3', async () => {
            return await this.hvac.t3.readTemperature();
        });
        this.thing.setPropertyReadHandler('temperature4', async () => {
            return await this.hvac.t4.readTemperature();
        });
        this.thing.setPropertyReadHandler('temperature5', async () => {
//            return await this.hvac.t5.readTemperature();
              return 123;
        });
        this.thing.setPropertyReadHandler('valveOpened1', async () => {
            return await this.hvac.valve1.isOpened();
        });
        this.thing.setPropertyReadHandler('valveClosed1', async () => {
            return await this.hvac.valve1.isClosed();
        });
        this.thing.setPropertyReadHandler('valveOpened2', async () => {
            return await this.hvac.valve2.isOpened();
        });
        this.thing.setPropertyReadHandler('valveClosed2', async () => {
            return await this.hvac.valve2.isClosed();
        });
        this.thing.setPropertyReadHandler('valveOpened3', async () => {
            return await this.hvac.valve3.isOpened();
        });
        this.thing.setPropertyReadHandler('valveClosed3', async () => {
            return await this.hvac.valve3.isClosed();
        });
        this.thing.setPropertyReadHandler('valveOpened4', async () => {
            return await this.hvac.valve4.isOpened();
        });
        this.thing.setPropertyReadHandler('valveClosed4', async () => {
            return await this.hvac.valve4.isClosed();
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
