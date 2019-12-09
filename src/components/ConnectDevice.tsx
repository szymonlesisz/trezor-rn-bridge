import React, { useState, useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import Modal, { BottomModal, ModalContent, SlideAnimation } from 'react-native-modals';

import styles from './styles';


const addDevice = () => ({
    type: 'DEVICE_CONNECT',
    device: {
        label: 'My Trezor',
    },
});

const ModalWrapper = (props: any) => (
    <Modal
        visible={props.visible}>
        <ModalContent>
            { props.children }
        </ModalContent>
    </Modal>
)

const ConnectDevice = (props: any) => {
    const [step, setStep] = useState(0);

    let component;

    if (step === 1) {
        component = (
            <View>
                <Text style={styles.h1}>New device detected</Text>
                <Text>Remember this device in suite?</Text>
                <View style={{ margin: 20 }}>
                    <Button onPress={() => setStep(2)} title="Yes, i want to save data" />
                </View>
                <Button color='gray' onPress={() => setStep(2)} title="No, use incognito mode" />
            </View>
        )
    }

    if (step === 2) {
        component = (
            <View>
                <Text style={styles.h1}>Would you like to use passphrase?</Text>
                <View style={{ margin: 20 }}>
                    <Button onPress={() => setStep(3)} title="Yes" />
                </View>
                <Button 
                    color='gray' 
                    onPress={() => {
                        setStep(0)
                        setTimeout(props.addDevice);
                    }} 
                    title="No" />
            </View>
        )
    }

    if (step === 3) {
        component = (
            <View>
                <Text style={styles.h1}>Where do you want to enter your passphrase</Text>
                <View style={{ margin: 20 }}>
                    <Button onPress={() => setStep(4)} title="On device" />
                </View>
                <Button color='gray' onPress={() => setStep(5)} title="On host" />
            </View>
        )
    }

    if (step === 4) {
        component = (
            <View>
                <Text style={styles.h1}>Enter your passphrase (on device)</Text>
                <Button 
                    color='red'
                    onPress={() => {
                        setStep(0)
                        setTimeout(props.addDevice);
                    }}
                    title="User action with device" />
            </View>
        )
    }

    if (step === 5) {
        component = (
            <View>
                <Text style={styles.h1}>Enter your passphrase (on host)</Text>
                <Button
                    onPress={() => {
                        setStep(0)
                        setTimeout(props.addDevice);
                    }}
                    title="Enter" />
            </View>
        )
    }


    return (
        <View style={styles.container}>
            <Text style={styles.h1}>Connect your Trezor device</Text>
            <View style={{ margin: 20 }}>
                <Button 
                    color='red'
                    onPress={() => {
                        setStep(1);
                    }} 
                    title="User action with device" />
            </View>
            <ModalWrapper visible={step > 0 && props.devices.length < 1} onClose={() => console.log("HANDLE CLOSE")}>
                {component}
            </ModalWrapper>
        </View>
    )
}

const mapStateToProps = (state) => ({
    devices: state.devices,
});

const mapDispatchToProps = (dispatch) => ({
    addDevice: bindActionCreators(addDevice, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ConnectDevice);
