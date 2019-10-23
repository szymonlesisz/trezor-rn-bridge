import { NativeModules } from 'react-native';
import {parseBridgeRequest} from './utils';
// const { RNSerialport } = NativeModules;

// export default {
//     RNSerialport,
// };

const nativeFetch = fetch;

const onSuccess = (result: any) => {
    console.warn('success', result);
};

const onError = (error: any) => {
    console.warn('error', error);
};

export default (url: string, options: any) => {
    const request = parseBridgeRequest(url, options);
    if (request) {
        console.log(request);
        const { params, debug } = request;
        switch(request.method) {
            case 'enumerate':
                NativeModules.RNBridge.enumerate(debug, onSuccess, onError);
                break;
            case 'listen':
                NativeModules.RNBridge.listen(debug, options.body, onSuccess, onError);
                break;
            case 'acquire':
                NativeModules.RNBridge.acquire(debug, params.path, params.previous, onSuccess, onError);
                break;
            case 'release':
                NativeModules.RNBridge.release(debug, params.session, onSuccess, onError);
                break;
            case 'call':
                NativeModules.RNBridge.call(debug, params.session, options.body, onSuccess, onError);
                break;
            case 'post':
                NativeModules.RNBridge.post(debug, params.session, options.body, onSuccess, onError);
                break;    
            case 'read':
                NativeModules.RNBridge.read(debug, params.session, onSuccess, onError);
                break;          
            // no default 
        }
    }

    return nativeFetch(url, options);
}
