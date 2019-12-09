import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { View, Text, Button } from 'react-native';

import * as routerActions from '../actions/routerActions';
import ConnectDevice from './ConnectDevice';
import styles from './styles';

const Dashboard = (props: any) => {
    if (props.devices.length < 1) {
        return <ConnectDevice />;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>Dashboard</Text>
            <View style={{ margin: 20 }}>
                <Text>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam</Text>
            </View>
            <View style={{ margin: 20 }}>
                <Button onPress={() => props.goto('/settings/wallet')} title="Go to wallet settings" />
            </View>
            <View style={{ margin: 20 }}>
                <Button onPress={() => props.goto('/wallet')} title="Go to account details" />
            </View>
        </View>
    );
}

const mapStateToProps = (state) => ({
    devices: state.devices,
});

const mapDispatchToProps = (dispatch) => ({
    goto: bindActionCreators(routerActions.goto, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
