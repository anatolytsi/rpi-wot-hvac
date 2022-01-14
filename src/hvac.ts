import {TSensor} from './temperature_sensor';
import {Valve} from './valve';
import {AdcConfigs, GpioConfigs} from './interfaces/types';
import * as fs from "fs";

const conf = require('../hvac.conf.json');

export type OperationMode = 'manual' | 'autoWinter' | 'autoSummer';

type SaveFileType = {
    temperatureFeed: number;
    mode: OperationMode;
    hysteresis: number;
}

const SAVE_FILE_NAME = 'state.dump.json';

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
        this.readState();
        this.timer = setInterval(async () => {
            await this.timerMainCallback()
        }, 1000);
        setInterval(async () => {await this.dumpState()}, 60000);
    }

    public setMode(mode: OperationMode) {
        this.mode = mode;
        console.log(`Switching mode to "${mode}"`);
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

    private readState() {
        fs.readFile(SAVE_FILE_NAME, (err, data) => {
            if (err){
                console.error(err);
            } else {
                // @ts-ignore
                let save: SaveFileType = JSON.parse(data);
                this.temperatureFeed = save.temperatureFeed;
                this.hysteresis = save.hysteresis;
                this.setMode(save.mode);
            }
        })
    }

    private async dumpState() {
        let saveFile: SaveFileType = {
            temperatureFeed: this.temperatureFeed,
            mode: this.mode,
            hysteresis: this.hysteresis
        }
        let json = JSON.stringify(saveFile, null, 2);
        fs.writeFile(SAVE_FILE_NAME, json, () => {});
    }

    private async timerMainCallback() {
        await this.temperatureInside.readTemperature();
        await this.temperatureOutside.readTemperature();
        await this.temperatureHe1.readTemperature();
        await this.temperatureHe2.readTemperature();
        await this.temperatureHe3.readTemperature();
        await this.workerCallback();
    }

    private async commonCycle() {
        if (this.temperatureHe1.temperature >= (this.temperatureFeed + this.hysteresis)) {
            console.log(`Feed t ${this.temperatureHe1.temperature}ºC > ${this.temperatureFeed + this.hysteresis}ºC, closing valve 1`)
            this.valve1.close();
        } else if (this.temperatureHe1.temperature < this.temperatureFeed - this.hysteresis) {
            console.log(`Feed t ${this.temperatureHe1.temperature}ºC < ${this.temperatureFeed + this.hysteresis}ºC, openning valve 1`)
            this.valve1.open();
        }
        if (this.temperatureHe2.temperature >= (this.temperatureFeed + this.hysteresis)) {
            console.log(`Feed t ${this.temperatureHe2.temperature}ºC > ${this.temperatureFeed + this.hysteresis}ºC, closing valve 2`)
            this.valve2.close();
        } else if (this.temperatureHe2.temperature < this.temperatureFeed - this.hysteresis) {
            console.log(`Feed t ${this.temperatureHe2.temperature}ºC < ${this.temperatureFeed + this.hysteresis}ºC, openning valve 2`)
            this.valve2.open();
        }
    }

    private async autoSummerMode() {
        console.log('Executing "auto summer" logic');
        this.commonCycle();
        this.valve4.open();
        if (this.temperatureHe3.temperature >= (this.temperatureFeed + this.hysteresis)) {
            console.log(`Feed t ${this.temperatureHe3.temperature}ºC > ${this.temperatureFeed + this.hysteresis}ºC, closing valve 3`)
            this.valve3.close();
        } else if (this.temperatureHe3.temperature < this.temperatureFeed - this.hysteresis) {
            console.log(`Feed t ${this.temperatureHe3.temperature}ºC < ${this.temperatureFeed + this.hysteresis}ºC, openning valve 3`)
            this.valve3.open();
        }
    }

    private async autoWinterMode() {
        console.log('Executing "auto winter" logic');
        this.commonCycle();
        this.valve3.open();
        if (this.temperatureHe3.temperature >= (this.temperatureFeed + this.hysteresis)) {
            console.log(`Feed t ${this.temperatureHe3.temperature}ºC > ${this.temperatureFeed + this.hysteresis}ºC, openning valve 4`)
            this.valve4.open();
        } else if (this.temperatureHe3.temperature < this.temperatureFeed - this.hysteresis) {
            console.log(`Feed t ${this.temperatureHe3.temperature}ºC < ${this.temperatureFeed + this.hysteresis}ºC, closing valve 4`)
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
        adcConfig.address = parseInt(conf.sensors.inOutAddr, 16);
        this.temperatureInside = new TSensor(adcConfig, conf.sensors.insideChannel);
        this.temperatureOutside = new TSensor(adcConfig, conf.sensors.outsideChannel);
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
        this.valve1.isOpened();
        this.valve2.isOpened();
        this.valve3.isOpened();
        this.valve4.isOpened();
    }
}