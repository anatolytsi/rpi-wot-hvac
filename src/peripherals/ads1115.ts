import {i2cDeviceType} from './common';

const ADS1115 = require('ads1115');
const i2c = require('i2c-bus');

export interface Ads1115Config {
    address?: number;
    i2cDevice?: i2cDeviceType;
    bus?: any;
}

type mux = '0+1' | '0+3' | '1+3' | '2+3' | '0+GND' | '1+GND' | '2+GND' | '3+GND';

const channelMux: mux[] = [
    '0+GND',
    '1+GND',
    '2+GND',
    '3+GND'
];

export class Ads1115 implements Ads1115Config {
    address;
    bus;
    device: any;
    channels: number[];

    constructor(config: Ads1115Config) {
        this.address = config.address ?? 0x48;
        this.channels = [0, 0, 0, 0];
        if (config.bus) {
            this.bus = config.bus;
        } else {
            this.bus = i2c.openSync(config.i2cDevice ?? '/dev/i2c-0');
        }
    }

    async init() {
        this.device = await ADS1115(this.bus, this.address);
    }

    async read(channel: number): Promise<number> {
        if (channel < 0 || channel > 3) throw Error('Incorrect read channel selected');
        return await this.device.measure(channelMux[channel]);
    }
}
