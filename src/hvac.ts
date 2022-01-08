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
    private workerCallback: () => void;

    constructor() {
        this.temperatureFeed = 0;
        this.hysteresis = 0;
        this.workerCallback = async () => {};
        this.initSensors();
        this.initValves();
        this.setMode('manual');
        this.timer = setInterval(async () => {
            await this.timerMainCallback()
        }, 500);
    }

    public setMode(mode: OperationMode) {
        this.mode = mode;
        switch (mode) {
            case 'autoWinter':
                this.workerCallback = this.autoWinterMode;
                break;
            case 'autoSummer':
                this.workerCallback = this.autoSummerMode;
                break;
            case 'manual':
                this.workerCallback = async () => {};
                break;
            default:
                break;
        }
    }

    private async timerMainCallback() {
        // await this.temperatureInside.readTemperature();
        // await this.temperatureOutside.readTemperature();
        await this.temperatureHe1.readTemperature();
        await this.temperatureHe2.readTemperature();
        await this.temperatureHe3.readTemperature();
        await this.workerCallback();
    }

    private async commonCycle() {
        if (this.temperatureHe1.temperature >= (this.temperatureFeed + this.hysteresis)) {
            this.valve1.close();
        } else if (this.temperatureHe1.temperature < this.temperatureFeed - this.hysteresis) {
            this.valve1.open();
        }
        if (this.temperatureHe2.temperature >= (this.temperatureFeed + this.hysteresis)) {
            this.valve2.close();
        } else if (this.temperatureHe2.temperature < this.temperatureFeed - this.hysteresis) {
            this.valve2.open();
        }
    }

    private async autoSummerMode() {
        this.commonCycle();
        this.valve4.open();
        if (this.temperatureHe3.temperature >= (this.temperatureFeed + this.hysteresis)) {
            this.valve3.close();
        } else if (this.temperatureHe3.temperature < this.temperatureFeed - this.hysteresis) {
            this.valve3.open();
        }
    }

    private async autoWinterMode() {
        this.commonCycle();
        if (this.temperatureHe3.temperature >= (this.temperatureFeed + this.hysteresis)) {
            this.valve3.open();
            this.valve4.open();
        } else if (this.temperatureHe3.temperature < this.temperatureFeed - this.hysteresis) {
            this.valve3.open();
            this.valve4.close();
        }
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