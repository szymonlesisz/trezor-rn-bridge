import { NativeModules } from 'react-native';

// const { RNSerialport } = NativeModules;

// export default {
//     RNSerialport,
// };

const nativeFetch = fetch;

export default (url: string, options: any) => {
    // NativeModules.RNBridge.fetch
    console.log("FECZ", nativeFetch);
    console.log("FECZ", url, options);
    NativeModules.RNBridge.fetch('url', 1);
    // return new Promise(() => {
        
    // });
    return nativeFetch(url, options);
}
