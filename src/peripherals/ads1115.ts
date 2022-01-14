import {i2cDeviceType} from './common';

const ADS1115 = require('ads1115');
const i2c = require('i2c-bus');

type Ads1115GainStr = '2/3' | '1' | '2' | '4' | '8' | '16';
type Ads1115GainNum = 1 | 2 | 4 | 8 | 16 | number;
export type Ads1115Gain = Ads1115GainStr | Ads1115GainNum;

export interface Ads1115Config {
    address?: number;
    i2cDevice?: i2cDeviceType;
    bus?: any;
    step?: number;
}

type mux = '0+1' | '0+3' | '1+3' | '2+3' | '0+GND' | '1+GND' | '2+GND' | '3+GND';

const channelMux: mux[] = [
    '0+GND',
    '1+GND',
    '2+GND',
    '3+GND'
];

export class Ads1115 implements Ads1115Config {
    address: number;
    bus: Promise<any> | any;
    device: any;
    channels: number[];
    step: number;
    static maxAdc: number = 32767;

    constructor(config: Ads1115Config) {
        this.address = config.address ?? 0x48;
        this.channels = [0, 0, 0, 0];
        if (config.bus) {
            this.bus = config.bus;
        } else {
            this.bus = i2c.openPromisified(config.i2cDevice ?? 1);
        }
    }

    get gain() {
        return this.device.gain;
    }

    set gain(gain: Ads1115Gain) {
        if (gain === 2/3) gain = '2/3';
        switch (gain) {
            case '2/3':
            case 2/3:
                this.step = 6.144 / Ads1115.maxAdc;
                this.device.gain = gain;
                break;
            case '1':
            case 1:
                this.step = 4.096 / Ads1115.maxAdc;
                this.device.gain = gain;
                break;
            case '2':
            case 2:
                this.step = 2.048 / Ads1115.maxAdc;
                this.device.gain = gain;
                break;
            case '4':
            case 4:
                this.step = 1.024 / Ads1115.maxAdc;
                this.device.gain = gain;
                break;
            case '8':
            case 8:
                this.step = 0.512 / Ads1115.maxAdc;
                this.device.gain = gain;
                break;
            case '16':
            case 16:
                this.step = 0.256 / Ads1115.maxAdc;
                this.device.gain = gain;
                break;
        }
    }

    async init() {
        this.device = await ADS1115(await this.bus, this.address);
        this.gain = '2/3';
    }

    async read(channel: number): Promise<number> {
        if (channel < 0 || channel > 3) throw Error('Incorrect read channel selected');
        return await this.device.measure(channelMux[channel]);
    }

    async readVoltage(channel: number): Promise<number> {
        let adcValue = await this.read(channel);
        adcValue = adcValue & 0x8000 ? - (adcValue & 0x7FF) : adcValue;
        return adcValue * this.step;
    }
}
