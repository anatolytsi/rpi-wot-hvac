import {TSensor} from './temperature_sensor';
import {Valve} from './valve';
import {AdcConfigs, GpioConfigs} from './interfaces/types';

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
    }

    private initValves() {
        let gpioConfig: GpioConfigs = {
            type: 'mcp23017',
            i2cDevice: 1,
            modeA: 'INPUT_PULLUP',
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
    }
}