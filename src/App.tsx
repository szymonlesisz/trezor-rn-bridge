import './hooks/global';
import React, { useEffect, useState } from 'react';
import { AppState, View, Text, Picker, Button } from 'react-native';
import TrezorConnect, { DEVICE_EVENT, DEVICE, Device } from 'trezor-connect';

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
    appState: any;
}
const initialState: State = {
    ready: false,
    devices: [],
    appState: AppState.currentState,
};

const getDeviceSelectItems = (devices: TrezorDeviceInfoDebug[]) => {
    if (devices.length === 0)
        return <Picker.Item label = "No connected devices" value = "none" />;

    return devices.map(d => {
        return <Picker.Item key={d.path} label={d.path} value={d.path} />
    });
}

const App = () => {
    const [state, setState] = useState(initialState);
    useEffect(() => {
        console.warn("App mount")
        const handleChange = (nextAppState: any) => {
            console.warn("AppState changed", nextAppState)
        }
        AppState.addEventListener('change', handleChange);


        TrezorConnect.on(DEVICE_EVENT, event => {
            if (event.type === DEVICE.CONNECT) {
                setState(state => ({
                    ...state,
                    devices: [{
                        path: event.payload.path,
                        debug: false,
                    }],
                    selectedDevice: event.payload.path,
                }));
            } else if (event.type === DEVICE.DISCONNECT) {
                setState(state => ({
                    ...state,
                    devices: [],
                    selectedDevice: undefined,
                }));
            }
        });

        TrezorConnect.init({
            debug: true,
            popup: false,
            manifest: {
                email: 'email@trezor.io',
                appUrl: 'react-native',
            }
        })
        .then(() => {
            setState(state => ({
                ...state,
                ready: true,
            }));
        })
        .catch(error => {
            console.log("INIT ERROR", error);
        });

        return () => {
            console.warn("App unmount")
            AppState.removeEventListener('change', handleChange);
            TrezorConnect.dispose();
        }
    }, []);
    return (
        <Buttons {...state} />
    )
};

const buttonsState = {
    response: ''
};

const Buttons = (props: State) => {
    const [state, setState] = useState(buttonsState);

    const call = async (type: string, params: any) => {
        try {
            const response = await TrezorConnect[type](params);
            setState(state => ({
                ...state,
                response: JSON.stringify(response, null, 2),
            }));
        } catch (error) {
            setState(state => ({
                ...state,
                response: error,
            }));
        }
    }
    

    // console.log("deviceList", state, state.devices)

    if (!props.ready) {
        return (
            <View>
                <Text>Loading trezor-connect...</Text>
            </View>
        )
    }

    return (
        <View>
            <Text>Connected devices: { props.devices.length }</Text>
            <Picker 
                selectedValue={props.selectedDevice} 
                // onValueChange = {(value) => {
                //     // setState(state => ({
                //     //     ...state,
                //     //     selectedDevice: value,
                //     // }));
                // }}
            >
                { getDeviceSelectItems(props.devices) }
            </Picker>

            {props.devices.length > 0 && (
                <View>
                    <Button onPress={() => call('applySettings', {
                        label: 'New Label!'
                    })} title="Apply settings">Apply settings</Button>
                    <Button onPress={() => call('getPublicKey', {
                        path: "m/49'/1'/0'",
                        coin: 'test',
                    })} title="Get Public Key">GetPK</Button>
                    <Button onPress={() => call('getAddress', {
                        path: "m/49'/0'/0'/0/0",
                        coin: 'btc',
                    })} title="Get Address">GetAddress</Button>
                    <Button onPress={() => call('getAccountInfo', {
                        descriptor: 'vpub5YX1yJFY8E236pH3iNvCpThsXLxoQoC4nwraaS5h4TZwaSp1Gg9SQoxCsrumxjh7nZRQQkNfH29TEDeMvAZVmD3rpmsDnFc5Sj4JgJG6m4b',
                        coin: 'test',
                    })} title="Get Testnet account (no device)">Get Testnet account (no device)</Button>
                    <Button onPress={() => call('getAccountInfo', {
                        path: "m/49'/1'/0'",
                        coin: 'test',
                    })} title="Get Testnet account">Get Testnet account</Button>
                    <Button onPress={() => call('getAccountInfo', {
                        path: "m/44'/144'/0'/0/0",
                        details: 'txs',
                        coin: 'txrp',
                    })} title="Get XRP account">Get XRP account</Button>
                    <Text>Response: { state.response }</Text>
                </View>
            )}
        </View>
    );
};

export default App;
