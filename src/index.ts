import { NativeModules } from 'react-native';

// const { RNSerialport } = NativeModules;

// export default {
//     RNSerialport,
// };

export default (url: string, options: any) => {
    // NativeModules.RNBridge.fetch
    console.log("FECZ", url, options);
    NativeModules.RNBridge.fetch('url', 1);
    return new Promise(() => {
        
    });
}
