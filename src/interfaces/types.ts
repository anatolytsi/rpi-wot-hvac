import {Ads1115Config as Ads1115} from '../peripherals/ads1115';
import {Mcp23017Config as Mcp23017} from '../peripherals/mcp23017';

export const Ads1115_t = 'ads1115';
type Ads1115Type = 'ads1115';
export type AdcTypes = Ads1115Type;

export interface Ads1115Config extends Ads1115{
    type: Ads1115Type
}
export type AdcConfigs = Ads1115Config;

export const Mcp23017_t = 'mcp23017';
type Mcp23017Type = 'mcp23017';
export const Native_t = 'native';
type NativeType = 'native';
export type GpioTypes = Mcp23017Type | NativeType;

export interface Mcp23017Config extends Mcp23017{
    type: Mcp23017Type
}
export interface NativeConfig {
    type: NativeType
}
export type GpioConfigs = Mcp23017Config | NativeConfig;
