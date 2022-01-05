import {AdcIf, initAdc} from './interfaces/adc';
import {AdcConfigs} from './interfaces/types';

interface TSensorConfig {
    adc: AdcIf;
    channel: number;
}

export class TSensor implements TSensorConfig {
    adc;
    channel;

    constructor(adcConfig: AdcConfigs, channel: number) {
        this.adc = initAdc(adcConfig);
        this.channel = channel;
    }

    async readTemperature(): Promise<number> {
        let adcValue: number = await this.adc.read(this.channel);
        console.log(`ADC value is ${adcValue}`);
        // TODO: calculate temperature from ADC
        return adcValue;
    }
}
