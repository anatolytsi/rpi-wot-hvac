import {AdcIf, initAdc} from './interfaces/adc';
import {AdcConfigs} from './interfaces/types';

interface TSensorConfig {
    adc: AdcIf;
    channel: number;
    t0: number;
    r0: number;
    beta: number;
    adcMax: number;
    vIn: number;
    r: number;
}

export class TSensor implements TSensorConfig {
    adc: AdcIf;
    channel: number;
    t0: number;
    r0: number;
    beta: number;
    adcMax: number;
    vIn: number;
    r: number;
    private _temperature: number;

    constructor(adcConfig: AdcConfigs, channel: number, t0: number = 298.15, r0: number = 10000,
                beta: number = 3950, adcMax: number = 32767, vIn: number = 5, r: number = 10000) {
        this.adc = initAdc(adcConfig);
        this.channel = channel;
        this.t0 = t0;
        this.r0 = r0;
        this.beta = beta;
        this.adcMax = adcMax;
        this.vIn = vIn;
        this.r = r;
    }

    public get temperature() {
        return this._temperature;
    }

    async readTemperature(): Promise<number> {
        let vOut = await this.adc.readVoltage(this.channel);
        let rNtc = this.r * (this.vIn / vOut - 1);
        let temperature: number = this.beta / Math.log(rNtc / (this.r0 * Math.exp(- this.beta / this.t0))) - 273.15;
        temperature = Math.round(temperature * 100) / 100;
        this._temperature = temperature;
        // console.log(`Temperature is ${temperature}, Resistance is ${rNtc}, Voltage is ${vOut}`);
        return temperature;
    }
}
