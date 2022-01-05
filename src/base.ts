import {TSensor} from './temperature_sensor';
import {Valve} from './valve';
import {AdcConfigs, GpioConfigs} from "./interfaces/types";

export class WotHvac {
    public thing!: WoT.ExposedThing;
    public td!: WoT.ThingDescription;
    private WoT: WoT.WoT;
    private t1!: TSensor;
    private t2!: TSensor;
    private t3!: TSensor;
    private t4!: TSensor;
//    private t5!: TSensor;
    private valve1!: Valve;
    private valve2!: Valve;
    private valve3!: Valve;
    private valve4!: Valve;

    constructor(WoT: WoT.WoT, tm: any) {
        this.WoT = WoT;
        this.WoT.produce(tm).then((exposedThing: WoT.ExposedThing) => {
            this.thing = exposedThing;
            this.td = this.thing.getThingDescription();
            let adcConfig: AdcConfigs = {
                type: 'ads1115',
                i2cDevice: 1,
                address: 0x48
            };
            this.t1 = new TSensor(adcConfig, 0);
            this.t2 = new TSensor(adcConfig, 1);
            this.t3 = new TSensor(adcConfig, 2);
            this.t4 = new TSensor(adcConfig, 3);
  //          adcConfig.address = 0x49;
  //          this.t5 = new TSensor(adcConfig, 0);
            let gpioConfig: GpioConfigs = {
                type: 'mcp23017',
                i2cDevice: '/dev/i2c-1',
                modeA: 'INPUT',
                modeB: 'OUTPUT',
                address: 0x20
            };
            this.valve1 = new Valve(
                {openPin: 8, closePin: 9, openedSwPin: 0, closedSwPin: 1},
                gpioConfig
            )
            this.valve2 = new Valve(
                {openPin: 10, closePin: 11, openedSwPin: 2, closedSwPin: 3},
                gpioConfig
            )
            this.valve3 = new Valve(
                {openPin: 12, closePin: 13, openedSwPin: 4, closedSwPin: 5},
                gpioConfig
            )
            this.valve4 = new Valve(
                {openPin: 14, closePin: 15, openedSwPin: 6, closedSwPin: 7},
                gpioConfig
            )
            this.addPropertyHandlers();
            this.addActionHandlers();
            this.addEventHandlers();
        })
    }

    private addPropertyHandlers() {
        this.thing.setPropertyReadHandler('temperature1', async () => {
            return await this.t1.readTemperature();
        });
        this.thing.setPropertyReadHandler('temperature2', async () => {
            return await this.t2.readTemperature();
        });
        this.thing.setPropertyReadHandler('temperature3', async () => {
            return await this.t3.readTemperature();
        });
        this.thing.setPropertyReadHandler('temperature4', async () => {
            return await this.t4.readTemperature();
        });
        this.thing.setPropertyReadHandler('temperature5', async () => {
//            return await this.t5.readTemperature();
              return 123;
        });
        this.thing.setPropertyReadHandler('valveOpened1', async () => {
            return await this.valve1.isOpened();
        });
        this.thing.setPropertyReadHandler('valveClosed1', async () => {
            return await this.valve1.isClosed();
        });
        this.thing.setPropertyReadHandler('valveOpened2', async () => {
            return await this.valve2.isOpened();
        });
        this.thing.setPropertyReadHandler('valveClosed2', async () => {
            return await this.valve2.isClosed();
        });
        this.thing.setPropertyReadHandler('valveOpened3', async () => {
            return await this.valve3.isOpened();
        });
        this.thing.setPropertyReadHandler('valveClosed3', async () => {
            return await this.valve3.isClosed();
        });
        this.thing.setPropertyReadHandler('valveOpened4', async () => {
            return await this.valve4.isOpened();
        });
        this.thing.setPropertyReadHandler('valveClosed4', async () => {
            return await this.valve4.isClosed();
        });
    }

    private addActionHandlers() {
        this.thing.setActionHandler('openValve1', async () => {
            return this.valve1.open();
        });
        this.thing.setActionHandler('closeValve1', async () => {
            return this.valve1.close();
        });
        this.thing.setActionHandler('openValve2', async () => {
            return this.valve2.open();
        });
        this.thing.setActionHandler('closeValve2', async () => {
            return this.valve2.close();
        });
        this.thing.setActionHandler('openValve3', async () => {
            return this.valve3.open();
        });
        this.thing.setActionHandler('closeValve3', async () => {
            return this.valve3.close();
        });
        this.thing.setActionHandler('openValve4', async () => {
            return this.valve4.open();
        });
        this.thing.setActionHandler('closeValve4', async () => {
            return this.valve4.close();
        });
    }

    private addEventHandlers() {

    }
}
