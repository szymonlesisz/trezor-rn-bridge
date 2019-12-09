import React from 'react';
import { View, Text, Button } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styles from './styles';


const addDevice = () => ({
    type: 'DEVICE_CONNECT',
    device: {
        label: 'My Trezor',
    },
});

const DeviceSelect = (props: any) => {
    console.warn("DEV SEL", props.devices);
    return (
        <View style={styles.container}>
            <Text style={styles.h1}>Connect your Trezor device</Text>
            <View style={{ margin: 20 }}>
                <Button color='red' onPress={props.addDevice} title="Action with device" />
            </View>
        </View>
    );
}

const mapStateToProps = (state) => ({
    devices: state.devices,
});

const mapDispatchToProps = (dispatch) => ({
    addDevice: bindActionCreators(addDevice, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(DeviceSelect);
