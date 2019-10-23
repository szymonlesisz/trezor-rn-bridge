import './hooks/global';
import rnBridge from './index';
import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import TrezorConnect, { DEVICE_EVENT, DEVICE, Device } from 'trezor-connect';

const getPublicKey = async () => {
    const resp = await TrezorConnect.getPublicKey({
        path: "m/49'/1'/0'",
        coin: 'testnet',
        useEmptyPassphrase: true,
    });

    if (resp.success) {
        console.warn("SUCCESS: ", resp.payload)
    } else {
        console.warn("ERROR: ", resp)
    }
}

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
    devices: Device[];
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
    try {
        await TrezorConnect.init({
            debug: false,
            webusb: false,
            // env: 'react-native',
            manifest: {
                email: 'email@trezor.io',
                appUrl: 'react-native',
            }
        });
        return true;
    } catch (error) {
        console.warn("CONNECT ERROR", error);
        return false;
    }
}

const App = (_props: any) => {
    const [state, setState] = useState(initialState);
    
    useEffect(() => {
        TrezorConnect.on(DEVICE_EVENT, event => {
            if (event.type === DEVICE.CONNECT) {
                setState(state => ({
                    ...state,
                    devices: state.devices.concat(event.payload),
                }));
            }
            if (event.type === DEVICE.DISCONNECT) {
                const devices = state.devices.filter(d => d.path === event.payload.path);
                setState(state => ({
                    ...state,
                    devices,
                }));
            }
        });

        init().then(ready => {
            setState(state => ({
                ...state,
                ready,
            }));
        })

        return () => {
            // TrezorConnect.dispose();
        }
    }, []);

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
            {state.devices.length > 0 && (<Button onPress={getPublicKey} title="Get public key">Get public key</Button>) }
        </View>
    );
};

export default App;
