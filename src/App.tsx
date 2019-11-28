import './hooks/global';
import rnBridge from './index';
import React, { useEffect, useState } from 'react';
import { View, Text, Picker, Button } from 'react-native';

import TrezorLink from 'trezor-link';
const { Lowlevel, Fallback } = TrezorLink;
import ReactNativePlugin from './RNPlugin';

const messagesJSON = require('trezor-connect/data/messages/messages.json/');

type TrezorDeviceInfoDebug = {
    path: string;
    debug: boolean;
};

// import TrezorConnect, { DEVICE_EVENT, DEVICE, Device } from 'trezor-connect';

// const getPublicKey = async () => {
//     const resp = await TrezorConnect.getPublicKey({
//         path: "m/49'/1'/0'",
//         coin: 'testnet',
//         useEmptyPassphrase: true,
//     });

//     if (resp.success) {
//         console.warn("SUCCESS: ", resp.payload)
//     } else {
//         console.warn("ERROR: ", resp)
//     }
// }

// const getAccountInfo = async () => {
//     const resp = await TrezorConnect.getAccountInfo({
//         path: "m/49'/1'/0'",
//         coin: 'testnet',
//         useEmptyPassphrase: true,
//     });

//     if (resp.success) {
//         console.warn("SUCCESS: ", resp.payload)
//     } else {
//         console.warn("ERROR: ", resp)
//     }
// }



interface State {
    ready: boolean;
    // devices: Device[];
    devices: TrezorDeviceInfoDebug[];
    selectedDevice?: string;
    transport?: any;
    response?: string;
}
const initialState: State = {
    ready: false,
    devices: [],
};

const init = async () => {
    // @ts-ignore
    global.fetch = rnBridge;
    // @ts-ignore
    process.env.RN_EMULATOR = true;
    // @ts-ignore
    process.env.RN_OS = 'android';
    // try {
    //     await TrezorConnect.init({
    //         debug: true,
    //         webusb: false,
    //         // env: 'react-native',
    //         manifest: {
    //             email: 'email@trezor.io',
    //             appUrl: 'react-native',
    //         }
    //     });
    //     return true;
    // } catch (error) {
    //     console.warn("CONNECT ERROR", error);
    //     return false;
    // }
    const transportTypes = [new Lowlevel(new ReactNativePlugin())];
    const transport = new Fallback(transportTypes);
    await transport.init(false);
    await transport.configure(JSON.stringify(messagesJSON));
    
    return transport;
}

let _path = null;

const call1 = async (transport: any, type: string) => {
    // let url = 'http://10.0.0.0/';

    // const options = {
    //     body: undefined,
    //     credentials: 'same-origin',
    //     headers: { 
    //         'Content-Type': 'text/plain',
    //         Origin: 'https://node.trezor.io' 
    //     },
    //     body: undefined,
    // }

    // if (type === 'enumerate') {
    //     url += 'enumerate';
    // }
    // if (type === 'listen') {
    //     url += 'listen';
    // }

    // if (type === 'initialize') {
    //     url += 'call/' + _path;
    //     options.body = '000000000000';
    // }
    // const result = await rnBridge(url, options);

    // if (!result.ok) {
    //     console.warn("RESULT ERROR", result.error);
    //     return;
    // }

    // if (type === 'enumerate') {
    //     try {
    //         const json = JSON.parse(result.text());
    //         console.warn("JSON", json, json.length, Array.isArray(json));
    //         if (Array.isArray(json) && json.length > 0) {
    //             console.warn("DEV", json[0]);
    //             console.warn("DEVp", json[0].path);
    //             _path = json[0].path;
    //         }
            
    //         // _path = json[0].path;
    //     } catch (error) {
    //         console.warn(error);
    //     }
    // }

    // if (type === 'enumerate') {
    //     try {
    //         const response = await state.transport.enumerate();
    //         setState(state => ({
    //             ...state,
    //             response: error,
    //         }));
    //     } catch (error) {
    //         setState(state => {
    //             ...state,
    //             response: error,
    //         });
    //     }
        

    // }

    
    // if (type === 'enumerate') {
    //     const json = JSON.parse(result);
    //     _path = json[0].path;
    // }
    console.warn("MyResult", result);
}

const getDeviceSelectItems = (devices: TrezorDeviceInfoDebug[]) => {
    if (devices.length === 0)
        return <Picker.Item label = "No connected devices" value = "none" />;

    return devices.map(d => {
        return <Picker.Item key={d.path} label={d.path} value={d.path} />
    });
}

const App = (_props: any) => {
    const [state, setState] = useState(initialState);
    
    useEffect(() => {
        // TrezorConnect.on(DEVICE_EVENT, event => {
        //     if (event.type === DEVICE.CONNECT) {
        //         setState(state => ({
        //             ...state,
        //             devices: state.devices.concat(event.payload),
        //         }));
        //     }
        //     if (event.type === DEVICE.DISCONNECT) {
        //         const devices = state.devices.filter(d => d.path === event.payload.path);
        //         setState(state => ({
        //             ...state,
        //             devices,
        //         }));
        //     }
        // });

        init()
        .then(transport => {
            console.log("INFO", transport);
            setState(state => ({
                ...state,
                ready: true,
                transport,
            }));
        })
        .catch(error => {
            console.log("INIT ERROR", error);
        });

        return () => {
            // TrezorConnect.dispose();
        }
    }, []);

    const call = async (type: string) => {
        try {
            let response = null;
            if (type === 'enumerate') {
                response = await state.transport.enumerate();
                setState(state => ({
                    ...state,
                    response: JSON.stringify(response),
                    devices: response,
                    selectedDevice: response.length > 0 ? response[0].path : undefined,
                }));
            }

            if (type === 'GetFeatures') {
                await state.transport.enumerate();
                const sessionId = await state.transport.acquire({ path: state.selectedDevice }, false);
                console.warn("SESS", sessionId);
                const call = await state.transport.call(sessionId, 'GetFeatures', {}, false);
                console.warn("RESP", call)
            }

            

            // setState(state => ({
            //     ...state,
            //     response: response,
            // }));
        } catch (error) {
            console.log("RESPERROR", error)
            // setState(state => ({
            //     ...state,
            //     response: error,
            // }));
        }
    }
    

    // console.log("deviceList", state, state.devices)

    if (!state.ready) {
        return (
            <View>
                <Text>Loading trezor-connect...</Text>
            </View>
        )
    }

    return (
        <View>
            <Text>Connected devices: { state.devices.length }</Text>
            <Picker 
                selectedValue={state.selectedDevice} 
                onValueChange = {(value) => {
                    setState(state => ({
                        ...state,
                        selectedDevice: value,
                    }));
                }}
            >
                { getDeviceSelectItems(state.devices) }
            </Picker>
            {/* {state.devices.length > 0 && (<Button onPress={getPublicKey} title="Get public key">Get public key</Button>) } */}
            {/* <Button onPress={() => call(state, setState, 'info')} title="Info">Info</Button> */}
            <Button onPress={() => call('enumerate')} title="Enumerate">Enumerate</Button>
            {/* <Button onPress={() => call(state, setState, 'listen')} title="Listen">Listen</Button>
            <Button onPress={() => call(state, setState, 'acquire')} title="Acquire">Acquire</Button>
            <Button onPress={() => call(state, setState, 'release')} title="Release">Release</Button>
            <Button onPress={() => call(state, setState, 'initialize')} title="Initialize">Initialize</Button> */}
            <Button onPress={() => call('GetFeatures')} title="GetFeatures">GetFeatures</Button>
            <Text>Response: { state.response }</Text>
        </View>
    );
};

export default App;
