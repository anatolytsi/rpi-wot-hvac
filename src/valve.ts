import {GpioIf, initGpio} from './interfaces/gpio';
import {GpioConfigs} from './interfaces/types';
import {delay} from "./common";

interface ValvePins {
    openPin: number;
    closePin: number;
    openedSwPin: number;
    closedSwPin: number;
}

let usedPins: number[] = [];

export class Valve {
    private gpio: GpioIf;
    private openPin: number;
    private closePin: number;
    private openedPin: number;
    private closedPin: number;

    constructor(pins: ValvePins, gpioConfig: GpioConfigs) {
        this.gpio = initGpio(gpioConfig);
        let pinsArr = Object.values(pins);
        const intersection = pinsArr.filter(value => usedPins.includes(value));
        if (intersection.length) throw Error(`Pins ${intersection} are already in use!`);
        usedPins.concat(usedPins, pinsArr);
        this.openPin = pins.openPin;
        this.closePin = pins.closePin;
        this.openedPin = pins.openedSwPin;
        this.closedPin = pins.closedSwPin;
    }

    open() {
        this.gpio.pins[this.closePin].write(0);
        this.gpio.pins[this.openPin].write(1);
        let refreshTime = 200;
        let timeoutTime = 10000;
        let timeoutCounter = 0;
        let openTimer = setInterval(() => {
            this.gpio.pins[this.openedPin].read(async (value: number) => {
                if (value) {
                    this.gpio.pins[this.openPin].write(0);
                    await delay(500);
                    clearInterval(openTimer);
                }
                timeoutCounter++;
                if (refreshTime * timeoutCounter === timeoutTime) {
                    this.gpio.pins[this.openPin].write(0);
                    throw Error(`Pin ${this.openedPin} did not signal "opened" state within ${timeoutTime} ms`)
                }
            })
        }, refreshTime);
    }

    close() {
        this.gpio.pins[this.closePin].write(1);
        this.gpio.pins[this.openPin].write(0);
        let refreshTime = 200;
        let timeoutTime = 10000;
        let timeoutCounter = 0;
        let closeTimer = setInterval(() => {
            this.gpio.pins[this.closedPin].read(async (value: number) => {
                if (value) {
                    this.gpio.pins[this.closePin].write(0);
                    await delay(500);
                    clearInterval(closeTimer);
                }
                timeoutCounter++;
                if (refreshTime * timeoutCounter === timeoutTime) {
                    this.gpio.pins[this.closePin].write(0);
                    throw Error(`Pin ${this.closedPin} did not signal "closed" state within ${timeoutTime} ms`)
                }
            })
        }, refreshTime);
    }

    isOpened(): Promise<boolean> {
        return new Promise<boolean>((resolve => {
            this.gpio.pins[this.openedPin].read(async (value: number) => {
                resolve(!!value);
            })
        }))
    }

    isClosed(): Promise<boolean> {
        return new Promise<boolean>((resolve => {
            this.gpio.pins[this.closedPin].read(async (value: number) => {
                resolve(!!value);
            })
        }))
    }
}