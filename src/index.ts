import { NativeModules } from 'react-native';
import {parseBridgeRequest} from './utils';

const nativeFetch = fetch;

export default async (url: string, options: any) => {
    const request = parseBridgeRequest(url, options);
    if (!request) return nativeFetch(url, options);

    const { params, debug } = request;
    let promise;
    switch(request.method) {
        case 'info':
            promise = NativeModules.RNBridge.info();
            break;
        case 'enumerate':
            promise = NativeModules.RNBridge.enumerate({ debug });
            break;
        case 'listen':
            promise = NativeModules.RNBridge.listen({ debug, previous: options.body});
            break;
        case 'acquire':
            promise = NativeModules.RNBridge.acquire({ debug, path: params.path, previous: params.previous });
            break;
        case 'release':
            promise = NativeModules.RNBridge.release({ debug, session: params.session });
            break;
        case 'call':
            promise = NativeModules.RNBridge.call({ debug, session: params.session, payload: options.body });
            break;
        case 'post':
            promise = NativeModules.RNBridge.post({ debug, session: params.session, payload: options.body });
            break;
        case 'read':
            promise = NativeModules.RNBridge.read({ debug, session: params.session });
            break;
        // no default 
    }

    try {
        const result = await promise;
        console.warn("Result", result)
        return {
            ok: true,
            text: () => result,
        };
    } catch (error) {
        return {
            ok: false,
            error,
        };
    }
}
