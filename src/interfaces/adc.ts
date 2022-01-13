import {AdcConfigs, AdcTypes, Ads1115_t} from './types';
import {Ads1115, Ads1115Gain} from '../peripherals/ads1115';

let adcConfigs: AdcConfigs[] = [];
let adcInstances: AdcIf[] = [];

export function initAdc(adcConfig: AdcConfigs): AdcIf {
    if (adcConfigs.includes(adcConfig)) {
        return adcInstances[adcConfigs.indexOf(adcConfig)];
    }
    adcConfigs.push({...adcConfig});
    let adc = new AdcIf(adcConfig);
    adcInstances.push(adc);
    return adc;
}

export class AdcIf {
    private adc: Ads1115;
    private init: boolean;
    private readonly type: AdcTypes;

    constructor(adcConfig: AdcConfigs) {
        this.init = false;
        this.type = adcConfig.type;
        if (adcConfig.type === 'ads1115') {
            let {type, ...config} = adcConfig;
            this.adc = new Ads1115(config);
        } else {
            throw Error('Incorrect ADC type');
        }
    }

    get gain() {
        return this.adc.gain;
    }

    set gain(gain: Ads1115Gain) {
        this.adc.gain = gain;
    }

    async read(channel: number = 0): Promise<number> {
        if (this.type === Ads1115_t) {
            if (!this.init) {
                await this.adc.init();
                this.init = true;
            }
            return await this.adc.read(channel);
        }
        throw Error('Incorrect ADC');
    }

    async readVoltage(channel: number = 0): Promise<number> {
        if (this.type === Ads1115_t) {
            if (!this.init) {
                await this.adc.init();
                this.init = true;
            }
            return await this.adc.readVoltage(channel);
        }
        throw Error('Incorrect ADC');
    }
}

