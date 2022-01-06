import {i2cDeviceType} from './common';

const MCP23017 = require('node-mcp23017');

type ModeType = 'INPUT' | 'INPUT_PULLUP' | 'OUTPUT';

interface Mcp23017PinConfig {
    device: any;
    num: number;
    mode?: ModeType;
    value?: number;
}

interface Mcp23017SideConfig {
    device: any;
    port?: 'A' | 'B';
    mode?: ModeType;
    pins?: Mcp23017Pin[];
}

export interface Mcp23017Config {
    address?: number;
    i2cDevice?: i2cDeviceType;
    debug?: boolean;
    modeA?: ModeType;
    modeB?: ModeType;
}

export class Mcp23017Pin implements Mcp23017PinConfig {
    device;
    num;
    mode;
    value;
    callback: (value: number) => any;

    constructor(config: Mcp23017PinConfig) {
        this.device = config.device;
        this.num = config.num ?? 0;
        this.mode = config.mode ?? 'INPUT';
        this.value = 0;
        this.callback = (value: number) => {
        };
    }

    write(value: boolean | number) {
        if (this.mode !== 'OUTPUT') {
            throw Error('Trying to write value when pin is not set as output');
        }
        let toWrite = value ? this.device.HIGH : this.device.LOW;
        this.device.digitalWrite(this.num, toWrite);
        this.value = toWrite;
    }

    read(callback?: (value: number) => any) {
        if (!this.mode.includes('INPUT')) {
            throw Error('Trying to read a value when pin is not set as input');
        }
        if (callback) {
            this.callback = callback;
        }
        this.device.digitalRead(this.num, this.readCallback);
    }

    private readCallback(err: any, value: number) {
        if (err) {
            console.error(err);
            return
        }
        console.log(`Pin №${this.num}: ${value}`);
        this.callback(value);
        this.value = value;
    }
}

class Mcp23017Side implements Mcp23017SideConfig {
    port;
    mode;
    pins;
    device: any;

    constructor(config: Mcp23017SideConfig) {
        this.port = config.port ?? 'A';
        let mode = config.mode ?? 'INPUT';
        if (mode.includes('INPUT')) {
            this.setGenericInput(mode);
        } else {
            this.setOutput();
        }
        this.mode = mode;
        this.pins = [];
        if (config.pins) {
            this.pins = config.pins;
        } else {
            let offset = this.port === 'A' ? 0 : 8;
            for (let i = 0; i < 8; i++) {
                this.pins.push(new Mcp23017Pin({
                    device: this.device,
                    num: i + offset,
                    mode: this.mode
                }));
            }
        }
        this.device = config.device;
    }

    setInput() {
        this.setGenericInput('INPUT');
    }

    setInputPullUp() {
        this.setGenericInput('INPUT_PULLUP');
    }

    setOutput() {
        this.mode = 'OUTPUT';
        for (const pin of this.pins) {
            pin.mode = 'OUTPUT';
            this.device.pinMode(pin.num, this.device.OUTPUT);
        }
    }

    private setGenericInput(mode: ModeType) {
        if (this.mode === mode) return;
        this.mode = mode;
        let oldMode = this.mode;
        if (!oldMode.includes('INPUT')) return;
        for (const pin of this.pins) {
            this.device.mode = mode;
            pin.read();
        }
    }

}

export class Mcp23017 implements Mcp23017Config {
    address;
    i2cDevice;
    debug;
    portA: Mcp23017Side;
    portB: Mcp23017Side;
    private device: any;

    constructor(config: Mcp23017Config) {
        this.address = config.address ?? 0x20;
        this.i2cDevice = config.i2cDevice ?? 1;
        this.debug = config.debug ?? false;
        this.device = new MCP23017({
            address: this.address,
            device: this.i2cDevice,
            debug: this.debug
        });
        this.portA = new Mcp23017Side({device: this.device, port: 'A', mode: config.modeA});
        this.portB = new Mcp23017Side({device: this.device, port: 'B', mode: config.modeB});
    }
}
