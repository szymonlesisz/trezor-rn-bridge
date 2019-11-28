import { NativeModules } from 'react-native';

interface RNBridge {
    enumerate(): Promise<USBDevice[]>;
    open(serialNumber: string, debugLink: boolean, configure: boolean): Promise<void>;
    close(serialNumber: string, debugLink: boolean, closePort: boolean): Promise<void>;
    write(serialNumber: string, debugLink: boolean, data: Uint8Array): Promise<void>;
    read(serialNumber: string, debugLink: boolean): Promise<{ data: Uint8Array }>;
}

type TrezorDeviceInfoDebug = {
    path: string;
    debug: boolean;
};

type USBDevice = {
    opened: boolean;
    vendorId: number;
    productId: number;
    serialNumber: string;
    configurations: any[];
}

type DeviceItem = {
    path: string;
    device: USBDevice;
    debug: boolean;
}

// const T1HID_VENDOR = 0x534c;

const TREZOR_DESCS = [
    // TREZOR v1
    // won't get opened, but we can show error at least
    { vendorId: 0x534c, productId: 0x0001 },
    // TREZOR webusb Bootloader
    { vendorId: 0x1209, productId: 0x53c0 },
    // TREZOR webusb Firmware
    { vendorId: 0x1209, productId: 0x53c1 },
];

const CONFIGURATION_ID = 1;
const INTERFACE_ID = 0;
const ENDPOINT_ID = 1;
const DEBUG_INTERFACE_ID = 1;
const DEBUG_ENDPOINT_ID = 2;

const bufferToHex = (buffer: ArrayBuffer) => { // buffer is an ArrayBuffer
    return Array.prototype.map.call(new Uint8Array(buffer), x => ('00' + x.toString(16)).slice(-2)).join('');
};

export default class ReactNativePlugin {
    name = 'ReactNativePlugin';

    version = '1.0.0';
    debug = false;
    allowsWriteAndEnumerate = true;

    usb: RNBridge;

    configurationId: number = CONFIGURATION_ID;
    normalInterfaceId: number = INTERFACE_ID;
    normalEndpointId: number = ENDPOINT_ID;
    debugInterfaceId: number = DEBUG_INTERFACE_ID;
    debugEndpointId: number = DEBUG_ENDPOINT_ID;

    constructor() {
        this.usb = NativeModules.RNBridge;
    }


    async init(debug?: boolean) {
        this.debug = !!debug;
        if (!this.usb) {
            throw new Error('ReactNative plugin is not available');
        }
    }

    // _deviceHasDebugLink(device: USBDevice) {
    //     try {
    //         const iface = device.configurations[0].interfaces[DEBUG_INTERFACE_ID].alternates[0];
    //         return iface.interfaceClass === 255 && iface.endpoints[0].endpointNumber === DEBUG_ENDPOINT_ID;
    //     } catch (e) {
    //         return false;
    //     }
    // }

    // _deviceIsHid(device: USBDevice) {
    //     return device.vendorId === T1HID_VENDOR;
    // }

    async _listDevices(): Promise<DeviceItem[]> {
        let bootloaderId = 0;
        const devices = await this.usb.enumerate();
        const trezorDevices = devices.filter(dev => {
            const isTrezor = TREZOR_DESCS.some(desc =>
                dev.vendorId === desc.vendorId && dev.productId === desc.productId
            );
            return isTrezor;
        });
        // const hidDevices = trezorDevices.filter(dev => this._deviceIsHid(dev));
        // const nonHidDevices = trezorDevices.filter(dev => !this._deviceIsHid(dev));

        this._lastDevices = trezorDevices.map(device => {
            // path is just serial number
            // more bootloaders => number them, hope for the best
            const { serialNumber } = device;
            let path = (!serialNumber || serialNumber === '') ? 'bootloader' : serialNumber;
            if (path === 'bootloader') {
                bootloaderId++;
                path = `${path}-${bootloaderId}`;
            }
            const debug = false; //this._deviceHasDebugLink(device);
            return { path, device, debug };
        });

        return this._lastDevices;
    }

    _lastDevices: DeviceItem[] = [];

    async enumerate(): Promise<TrezorDeviceInfoDebug[]> {
        // const blob = Buffer.from(p[this.recvStep], 'hex')
        const devices = await this.usb.enumerate();
        // console.log("ENUM2", devices, typeof devices, Array.isArray(devices));
        console.warn(devices);
        return devices;
        // return [ { path: "1", debug: false } ];
        // return (await this._listDevices()).map(info => ({path: info.path, debug: info.debug}));
    }

    async _findDevice(path: string) {
        const deviceO = (this._lastDevices).find(d => d.path === path);
        if (deviceO == null) {
            throw new Error(`Action was interrupted.`);
        }
        return deviceO.device;
    }

    async send(path: string, data: ArrayBuffer, debug: boolean) {
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

        console.warn("SEND!", path, data, debug)
        const resp = await this.usb.write({ path, data, dataHex: bufferToHex(data), debug: false });
        console.warn("SENDrsp!", resp)

        return resp;
    }

    recvStep = 0;

    async receive(path: string, debug: boolean): Promise<ArrayBuffer> {
        // const device = await this._findDevice(path);
        // const endpoint = debug ? this.debugEndpointId : this.normalEndpointId;

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

            const res = await this.usb.read({ path, debug });
            console.warn("RECV!", res)
            const buf = Buffer.from(res.data, 'hex');
            return buf.slice(1);

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

    async connect(path: string, debug: boolean, first: boolean) {
        for (let i = 0; i < 5; i++) {
            if (i > 0) {
                await new Promise((resolve) => setTimeout(() => resolve(), i * 200));
            }
            try {
                // await this.usb.open(path, debug, first);
                console.warn("device.open", path, first)
                return;
            } catch (e) {
                if (i === 4) {
                    throw e;
                }
            }
        }
    }

    async disconnect(path: string, debug: boolean, last: boolean) {
        await this.usb.close(path, debug, last);
    }
}
