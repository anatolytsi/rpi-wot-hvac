import {GpioConfigs, GpioTypes, Mcp23017_t} from './types';
import {Mcp23017, Mcp23017Pin} from '../peripherals/mcp23017';

let gpioConfigs: GpioConfigs[] = [];
let gpioInstances: GpioIf[] = [];

export function initGpio(gpioConfig: GpioConfigs): GpioIf {
    if (gpioConfigs.includes(gpioConfig)) {
        return gpioInstances[gpioConfigs.indexOf(gpioConfig)];
    }
    gpioConfigs.push(gpioConfig);
    let gpio = new GpioIf(gpioConfig);
    gpioInstances.push(gpio);
    return gpio;
}

export class GpioIf {
    pins: any[] | Mcp23017Pin[];
    private gpio: Mcp23017;
    private readonly type: GpioTypes;

    constructor(gpioConfig: GpioConfigs) {
        this.type = gpioConfig.type;
        this.pins = [];
        if (gpioConfig.type === Mcp23017_t) {
            let {type, ...config} = gpioConfig;
            this.gpio = new Mcp23017(config);
            this.pins = this.gpio.portA.pins.concat(this.gpio.portB.pins);
        } else {
            throw Error('Incorrect GPIO type');
        }
    }
}
