import {TSensor} from './temperature_sensor';
import {Valve} from './valve';
import {AdcConfigs, GpioConfigs} from './interfaces/types';

const conf = require('../hvac.conf.json');

export type OperationMode = 'manual' | 'auto';

export class Hvac {
    public t1: TSensor;
    public t2: TSensor;
    public t3: TSensor;
    public t4: TSensor;
//    public t5: TSensor;
    public valve1: Valve;
    public valve2: Valve;
    public valve3: Valve;
    public valve4: Valve;
    public mode: OperationMode;
    private timer!: NodeJS.Timer;

    constructor() {
        this.initSensors();
        this.initValves();
        this.setMode('auto');
    }

    public setMode(mode: OperationMode) {
        this.mode = mode;
        switch (mode) {
            case 'auto':
                this.timer = setInterval(() => this.autoMode(), 500);
                break;
            case 'manual':
                clearInterval(this.timer);
                break;
            default:
                break;
        }
    }

    private autoMode() {
        // TODO: define auto mode
    }

    private initSensors() {
        let adcConfig: AdcConfigs = {
            type: conf.sensors.type,
            i2cDevice: conf.i2cNum,
            address: parseInt(conf.sensors.t1ToT4Addr, 16)
        };
        this.t1 = new TSensor(adcConfig, conf.sensors.t1Channel);
        this.t2 = new TSensor(adcConfig, conf.sensors.t2Channel);
        this.t3 = new TSensor(adcConfig, conf.sensors.t3Channel);
        this.t4 = new TSensor(adcConfig, conf.sensors.t4Channel);
        // adcConfig.address = parseInt(conf.sensors.t5Addr, 16);
        // this.t5 = new TSensor(adcConfig, conf.sensors.t5Channel);
    }

    private initValves() {
        let gpioConfig: GpioConfigs = {
            type: conf.valves.type,
            i2cDevice: conf.i2cNum,
            modeA: conf.valves.modeA,
            modeB: conf.valves.modeB,
            address: parseInt(conf.valves.address, 16)
        };
        this.valve1 = new Valve(conf.valves.valve1, gpioConfig);
        this.valve2 = new Valve(conf.valves.valve2, gpioConfig);
        this.valve3 = new Valve(conf.valves.valve3, gpioConfig);
        this.valve4 = new Valve(conf.valves.valve4, gpioConfig);
    }
}