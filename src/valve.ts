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
    public opened: boolean;
    private gpio: GpioIf;
    private openPin: number;
    private closePin: number;
    private openedPin: number;
    private closedPin: number;
    private working: boolean;
    private refreshTime: number;
    private timeoutTime: number;
    private timeoutCounter: number;

    constructor(pins: ValvePins, gpioConfig: GpioConfigs) {
        this.refreshTime = 1000;
        this.timeoutTime = 10000;
        this.timeoutCounter = 0;
        this.opened = false;
        this.working = false;
        this.gpio = initGpio(gpioConfig);
        let pinsArr = Object.values(pins);
        const intersection = pinsArr.filter(value => usedPins.includes(value));
        if (intersection.length) throw Error(`Pins ${intersection} are already in use!`);
        usedPins.concat(usedPins, pinsArr);
        this.openPin = pins.openPin;
        this.closePin = pins.closePin;
        this.openedPin = pins.openedSwPin;
        this.closedPin = pins.closedSwPin;
        this.gpio.pins[this.openPin].write(1);
        this.gpio.pins[this.closePin].write(1);
    }

    open() {
        if (this.opened || this.working) return;
        this.isOpened().then(value => {
            if (value) return;
            this.working = true;
            this.gpio.pins[this.closePin].write(1);
            this.gpio.pins[this.openPin].write(0);
            let openTimer = setInterval(() => {
                this.isOpened().then(async (value: boolean) => {
                    if (value) {
                        this.opened = true;
                        this.gpio.pins[this.openPin].write(1);
                        await delay(500);
                        this.working = false;
                        clearInterval(openTimer);
                    }
                    this.timeoutCounter++;
                    if (this.refreshTime * this.timeoutCounter === this.timeoutTime) {
                        this.opened = true;
                        this.gpio.pins[this.openPin].write(1);
                        this.working = false;
                        clearInterval(openTimer);
                        throw Error(`Pin ${this.openedPin} did not signal "opened" state within ${this.timeoutTime} ms`);
                    }
                })
            }, this.refreshTime);
        });
    }

    close() {
        if (!this.opened || this.working) return;
        this.isClosed().then(value => {
            if (value) return;
            this.working = true;
            this.gpio.pins[this.closePin].write(0);
            this.gpio.pins[this.openPin].write(1);
            let closeTimer = setInterval(() => {
                this.isClosed().then(async (value: boolean) => {
                    if (value) {
                        this.opened = false;
                        this.gpio.pins[this.closePin].write(1);
                        await delay(1000);
                        this.working = false;
                        clearInterval(closeTimer);
                    }
                    this.timeoutCounter++;
                    if (this.refreshTime * this.timeoutCounter === this.timeoutTime) {
                        this.opened = false;
                        this.gpio.pins[this.closePin].write(1);
                        this.working = false;
                        clearInterval(closeTimer);
                        throw Error(`Pin ${this.closedPin} did not signal "closed" state within ${this.timeoutTime} ms`);
                    }
                })
            }, this.refreshTime);
        });
    }

    isOpened(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.gpio.pins[this.openedPin].read(async (value: boolean) => {
                this.opened = value;
                resolve(value);
            })
        })
    }

    isClosed(): Promise<boolean> {
        return new Promise<boolean>(resolve => {
            this.gpio.pins[this.closedPin].read(async (value: boolean) => {
                this.opened = !value;
                resolve(value);
            })
        })
    }
}