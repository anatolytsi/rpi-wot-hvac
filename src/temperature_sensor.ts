import {AdcIf, initAdc} from './interfaces/adc';
import {AdcConfigs} from './interfaces/types';

interface TSensorConfig {
    adc: AdcIf;
    channel: number;
    t0: number;
    beta: number;
    adcMax: number;
}

export class TSensor implements TSensorConfig {
    adc: AdcIf;
    channel: number;
    t0: number;
    beta: number;
    adcMax: number;

    constructor(adcConfig: AdcConfigs, channel: number, t0: number = 298.15,
                beta: number = 3435, adcMax: number = 32767) {
        this.adc = initAdc(adcConfig);
        this.channel = channel;
        this.t0 = t0;
        this.beta = beta;
        this.adcMax = adcMax;
    }

    async readTemperature(): Promise<number> {
        let adcValue: number = await this.adc.read(this.channel)
        adcValue = adcValue & 0x8000 ? - (adcValue & 0x7FF) : adcValue;
        let volts = adcValue * 5 / this.adcMax;
        adcValue = adcValue < 0 ? 0 : adcValue;
        let log = Math.log(this.adcMax / adcValue - 1);
        let temperature: number = Math.round((1.0 / (1.0 / this.t0 + log / this.beta) - 273.15) * 100) / 100;
        console.log(`Temperature is ${temperature}, ADC value is ${adcValue}, Voltage is ${volts}`);
        return temperature;
    }
}
