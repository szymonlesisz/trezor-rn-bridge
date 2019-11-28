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
                console.warn("sessionId", sessionId);
                const features = await state.transport.call(sessionId, 'GetFeatures', {}, false);
                console.warn("RESP", features)
            }
        } catch (error) {
            console.warn("ERROR", error)
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
