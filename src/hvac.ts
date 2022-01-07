import {TSensor} from './temperature_sensor';
import {Valve} from './valve';
import {AdcConfigs, GpioConfigs} from './interfaces/types';

const conf = require('../hvac.conf.json');

export type OperationMode = 'manual' | 'autoWinter' | 'autoSummer';

export class Hvac {
    public temperatureFeed: number;
    public temperatureInside: TSensor;
    public temperatureOutside: TSensor;
    public temperatureHe1: TSensor;
    public temperatureHe2: TSensor;
    public temperatureHe3: TSensor;
    public valve1: Valve;
    public valve2: Valve;
    public valve3: Valve;
    public valve4: Valve;
    public mode: OperationMode;
    public hysteresis: number;
    private timer!: NodeJS.Timer;

    constructor() {
        this.temperatureFeed = 0;
        this.hysteresis = 0;
        this.initSensors();
        this.initValves();
        this.setMode('manual');
    }

    public setMode(mode: OperationMode) {
        this.mode = mode;
        switch (mode) {
            case 'autoWinter':
                this.timer = setInterval(async () => this.autoWinterMode(), 5000);
                break;
            case 'autoSummer':
                this.timer = setInterval(async () => this.autoSummerMode(), 5000);
                break;
            case 'manual':
                clearInterval(this.timer);
                break;
            default:
                break;
        }
    }

    private async commonCycle() {
        this.temperatureHe1.readTemperature().then((temperature) => {
            if (temperature >= (this.temperatureFeed + this.hysteresis)) {
                this.valve1.close();
            } else if (temperature < this.temperatureFeed - this.hysteresis) {
                this.valve1.open();
            }
        });
        this.temperatureHe2.readTemperature().then((temperature) => {
            if (temperature >= (this.temperatureFeed + this.hysteresis)) {
                this.valve2.close();
            } else if (temperature < this.temperatureFeed - this.hysteresis) {
                this.valve2.open();
            }
        });
    }

    private async autoSummerMode() {
        this.commonCycle();
        this.valve4.open();
        this.temperatureHe3.readTemperature().then((temperature) => {
            if (temperature >= (this.temperatureFeed + this.hysteresis)) {
                this.valve3.close();
            } else if (temperature < this.temperatureFeed - this.hysteresis) {
                this.valve3.open();
            }
        });
    }

    private async autoWinterMode() {
        this.commonCycle();
        this.temperatureHe3.readTemperature().then((temperature) => {
            if (temperature >= (this.temperatureFeed + this.hysteresis)) {
                this.valve3.open();
                this.valve4.open();
            } else if (temperature < this.temperatureFeed - this.hysteresis) {
                this.valve3.open();
                this.valve4.close();
            }
        });
    }

    private initSensors() {
        let adcConfig: AdcConfigs = {
            type: conf.sensors.type,
            i2cDevice: conf.i2cNum,
            address: parseInt(conf.sensors.heAddr, 16)
        };
        this.temperatureHe1 = new TSensor(adcConfig, conf.sensors.he1Channel);
        this.temperatureHe2 = new TSensor(adcConfig, conf.sensors.he2Channel);
        this.temperatureHe3 = new TSensor(adcConfig, conf.sensors.he3Channel);
        // adcConfig.address = parseInt(conf.sensors.inOutAddr, 16);
        // this.temperatureInside = new TSensor(adcConfig, conf.sensors.insideChannel);
        // this.temperatureOutside = new TSensor(adcConfig, conf.sensors.outsideChannel);
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