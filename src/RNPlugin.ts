import { NativeModules } from 'react-native';

type TrezorDeviceInfoDebug = {
    path: string;
    debug: boolean;
};
interface RNBridge {
    enumerate(): Promise<TrezorDeviceInfoDebug[]>;
    acquire(path: string, debugLink: boolean): Promise<void>;
    release(serialNumber: string, debugLink: boolean, closePort: boolean): Promise<void>;
    write(serialNumber: string, debugLink: boolean, data: Uint8Array): Promise<void>;
    read(serialNumber: string, debugLink: boolean): Promise<{ data: Uint8Array }>;
}

const bufferToHex = (buffer: ArrayBuffer) => { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
};

export default class ReactNativePlugin {
    name = 'ReactNativePlugin';

    version = '1.0.0';
    debug = false;
    allowsWriteAndEnumerate = true;

    usb: RNBridge;

    constructor() {
        this.usb = NativeModules.RNBridge;
    }

    async init(debug?: boolean) {
        this.debug = !!debug;
        console.warn("init");
        if (!this.usb) {
            throw new Error('ReactNative plugin is not available');
        }
    }

    async enumerate(): Promise<TrezorDeviceInfoDebug[]> {
        return this.usb.enumerate();
        // return [ { path: "1", debug: false } ];
    }

    async send(path: string, data: ArrayBuffer, _debugLink: boolean) {
        // const device = await this._findDevice(path);

        // const newArray = new Uint8Array(64);
        // newArray[0] = 63;
        // newArray.set(new Uint8Array(data), 1);

        // if (!device.opened) {
        //     await this.connect(path, debug, false);
        // }

        // const endpoint = debug ? this.debugEndpointId : this.normalEndpointId;

        // GetFeatures:
        // proto:  3f232300000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
        // tonative: 232300370000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
        // proto GetPub 2323000b0000001d08ac808080080881808080080880808080082207426974636f696e28000000000000000000000000000000000000000000000000000000

        console.warn("SEND!", path, data, bufferToHex(data))
        const resp = await this.usb.write({ path, data, dataHex: bufferToHex(data), debug: false });
        console.warn("SENDrsp!", resp)

        return resp;
    }

    async receive(path: string, debug: boolean): Promise<ArrayBuffer> {
        try {
            // if (!device.opened) {
            //     await this.connect(path, debug, false);
            // }

            // Features:
            // const p = [
            //     '3f232300110000005ed801000a097472657a6f722e696f1002180120013218434534433739454645414239443038313246463834353631380040014a07656e67',
            //     '3f6c69736852025432e0010060016a083761663164353835800100880100980100a00103aa010154000000000000000000000000000000000000000000000000',
            // ];
            // const buf = Buffer.from(p[this.recvStep], 'hex');
            // this.recvStep++;
            // console.log(buf);
            // return buf.slice(1);

            // const buf = Buffer.from('232300110000005ed801000a097472657a6f722e696f1002180120013218434534433739454645414239443038313246463834353631380040014a07656e676c69736852025432e0010060016a083761663164353835800100880100980100a00103aa010154000000000000000000000000000000000000000000000000', 'hex');
            // return buf;


            const res = await this.usb.read({ path, debug });
            // console.warn("RECV!", res)
            const buf = Buffer.from(res.data, 'hex');
            return buf;

            // const res = { data: new Buffer('00110000009d8002010a097472657a6f722e696f1002180120093218373142323536324531433039463838454342393136343336380040004a07656e676c69736852047465737488020060016a09313166386461326632800100880101980100a00100aa010154d80100e00100e80100f00101f00102f00103f00104f00105f00106f00107f00108f00109f0010af0010bf0010cf0010df0010ef0010ff00110f80100', 'hex') }; //await this.usb.read(path, debug);
            // if (res.data.byteLength === 0) {
            //     return this.receive(path, debug);
            // }
            // return res.data.buffer.slice(1);
        } catch (e) {
            if (e.message === `Device unavailable.`) {
                throw new Error(`Action was interrupted.`);
            } else {
                throw e;
            }
        }
    }

    async connect(path: string, debugLink: boolean) {
        for (let i = 0; i < 5; i++) {
            if (i > 0) {
                await new Promise((resolve) => setTimeout(() => resolve(), i * 200));
            }
            try {
                await this.usb.acquire(path, debugLink);
                return;
            } catch (e) {
                if (i === 4) {
                    throw e;
                }
            }
        }
    }

    async disconnect(path: string, debugLink: boolean, last: boolean) {
        return this.usb.release(path, debugLink, last);
    }
}
