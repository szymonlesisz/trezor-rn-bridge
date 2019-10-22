declare module 'trezor-connect' {

    export interface Settings {
        debug: boolean | { [k: string]: boolean };
        configSrc?: string; // constant
        origin?: string;
        hostLabel?: string;
        hostIcon?: string;
        priority?: number;
        trustedHost?: boolean;
        connectSrc?: string;
        iframeSrc?: string;
        popup?: boolean;
        popupSrc?: string;
        webusbSrc?: string;
        transportReconnect?: boolean;
        webusb?: boolean;
        pendingTransportEvent?: boolean;
        supportedBrowser?: boolean;
        extension?: string;
        lazyLoad?: boolean;
        manifest: {
            appUrl: string;
            email: string;
        };
        env?: string;
    }

    export type DeviceStatus = 'available' | 'occupied' | 'used';

    export type DeviceMode = 'normal' | 'bootloader' | 'initialize' | 'seedless';

    export type DeviceFirmwareStatus = 'valid' | 'outdated' | 'required' | 'unknown' | 'none';

    export interface FirmwareRelease {
        required: boolean;
        version: number[];
        min_bridge_version: number[];
        min_firmware_version: number[];
        bootloader_version: number[];
        min_bootloader_version: number[];
        url: string;
        channel: string;
        fingerprint: string;
        changelog: string;
    }

    export interface Features {
        bootloader_hash?: string | null;
        bootloader_mode?: boolean | null;
        device_id: string | null;
        firmware_present?: boolean | null;
        flags: number;
        fw_major?: number | null;
        fw_minor?: number | null;
        fw_patch?: number | null;
        fw_vendor?: string | null;
        fw_vendor_keys?: string | null;
        imported?: boolean | null;
        initialized: boolean;
        label: string | null;
        language?: string | null;
        major_version: number;
        minor_version: number;
        model: string;
        needs_backup: boolean;
        no_backup: boolean;
        passphrase_cached: boolean;
        passphrase_protection: boolean;
        patch_version: number;
        pin_cached: boolean;
        pin_protection: boolean;
        revision: string;
        unfinished_backup: boolean;
        vendor: string;
        recovery_mode?: boolean;
    }

    export type Device =
        | {
              type: 'acquired';
              path: string;
              label: string;
              firmware: DeviceFirmwareStatus;
              firmwareRelease?: FirmwareRelease;
              status: DeviceStatus;
              mode: DeviceMode;
              state?: string;
              features: Features;
          }
        | {
              type: 'unacquired' | 'unreadable';
              path: string;
              label: string;
              features: undefined;
          };

    export namespace DEVICE {
        // device list events
        export const CONNECT = 'device-connect';
        export const CONNECT_UNACQUIRED = 'device-connect_unacquired';
        export const DISCONNECT = 'device-disconnect';
        export const CHANGED = 'device-changed';
        export const ACQUIRE = 'device-acquire';
        export const RELEASE = 'device-release';
        export const ACQUIRED = 'device-acquired';
        export const RELEASED = 'device-released';
        export const USED_ELSEWHERE = 'device-used_elsewhere';

        export const LOADING = 'device-loading';

        // trezor-link events in protobuf format
        export const BUTTON = 'button';
        export const PIN = 'pin';
        export const PASSPHRASE = 'passphrase';
        export const PASSPHRASE_ON_DEVICE = 'passphrase_on_device';
        export const WORD = 'word';

        // custom
        export const WAIT_FOR_SELECTION = 'device-wait_for_selection';

        // this string has different prefix than other constants and it's used as device path
        export const UNREADABLE = 'unreadable-device';
    }
    export const DEVICE_EVENT = 'DEVICE_EVENT';

    export interface DeviceEvent {
        event: typeof DEVICE_EVENT;
        type:
            | typeof DEVICE.CONNECT
            | typeof DEVICE.CONNECT_UNACQUIRED
            | typeof DEVICE.CHANGED
            | typeof DEVICE.DISCONNECT;
        payload: Device;
    }

    namespace TrezorConnect {
        /**
         * Initializes TrezorConnect.
         */
        function init(settings: Settings): Promise<void>;

        /**
         * Retrieves BIP32 extended public derived by given BIP32 path.
         * User is presented with a description of the requested key and asked to
         * confirm the export.
         */
        function getPublicKey(params: GetPublicKeyParams): Promise<ResponseMessage<PublicKey>>;
        function getPublicKey(
            params: Bundle<GetPublicKeyParams>,
        ): Promise<ResponseMessage<PublicKey[]>>;

        function on(event: typeof DEVICE_EVENT, callback: (event: DeviceEvent) => void): void;
    }

    export default TrezorConnect;
}

// declare module 'trezor-link' {
//     export interface TrezorDeviceInfo {
//         path: string;
//     }
      
//     export interface TrezorDeviceInfoWithSession extends TrezorDeviceInfo {
//         session?: string;
//         debugSession?: string;
//         debug: boolean;
//     }
    
//     export interface AcquireInput {
//         path: string;
//         previous?: string | undefined;
//     }
//     export interface MessageFromTrezor {
//         type: string;
//         message: Object;
//     }
    
//     export interface Transport {
//         enumerate(): Promise<TrezorDeviceInfoWithSession[]>;
//         listen(old?: TrezorDeviceInfoWithSession[]): Promise<TrezorDeviceInfoWithSession[]>;
//         acquire(input: AcquireInput, debugLink: boolean): Promise<string>;
//         release(session: string, onclose: boolean, debugLink: boolean): Promise<void>;
//         configure(signedData: string): Promise<void>;
//         call(session: string, name: string, data: Object, debugLink: boolean): Promise<MessageFromTrezor>;
//         post(session: string, name: string, data: Object, debugLink: boolean): Promise<void>;
//         read(session: string, debugLink: boolean): Promise<MessageFromTrezor>;
      
//         // resolves when the transport can be used; rejects when it cannot
//         init(debug?: boolean): Promise<void>;
//         stop(): void;
      
//         configured: boolean;
//         version: string;
//         name: string;
//         activeName?: string;

//         // webusb has a different model, where you have to
//         // request device connection
//         requestDevice: () => Promise<void>;
//         requestNeeded: boolean;

//         isOutdated?: boolean;
//         setBridgeLatestUrl(url: string): void;
//     }

//     interface BridgeV2 extends Transport {}
//     class BridgeV2 {
//         static setFetch(a: any, b: any);
//         constructor(a: any, b: any, c: any);
//     }

//     interface Fallback extends Transport {}
//     class Fallback implements Transport {
//         constructor(transports: Transport[]);
//     }

//     export default {
//         BridgeV2,
//         Fallback,
//     };
// }