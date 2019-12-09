import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as routerActions from '../../actions/routerActions';
import DefaultDrawer from './Drawer';

const StyledButton = (props: any) => {
    return (
        <View style={{ margin: 5 }}>
            <Button {...props} />
        </View>
    )
}

const AccountsMenu = (props: any) => {
    const [step, setStep] = useState(0);


    if (step === 1) {
        return (
            <View>
                <View style={{ margin: 5, marginBottom: 20 }}>
                    <Button onPress={() => setStep(0)} title="Select account >" />
                </View>
                <DefaultDrawer />
            </View>
        )
    }
    return (
        <View>
            <View style={{ margin: 5, marginBottom: 20 }}>
                <Button onPress={() => setStep(1)} title="< Select application" />
            </View>
            <View style={{ margin: 5, marginBottom: 20 }}>
                <Button onPress={() => props.goto('/device-select')} title="My Trezor (device)" />
            </View>
            
            <Text>Accounts Menu</Text>
            <StyledButton onPress={() => props.goto('/wallet', { coin: 'BTC' })} title="BTC Account 1" />
            <StyledButton onPress={() => props.goto('/wallet', { coin: 'BTC' })} title="BTC Account 2" />
            <StyledButton onPress={() => props.goto('/wallet/account/receive', { coin: 'LTC' })} title="LTC Account 1" />
            {/* <StyledButton onPress={() => props.goto('/exchange')} title="Exchange" />
            <StyledButton onPress={() => props.goto('/passwords')} title="Passwords" />
            <StyledButton onPress={() => props.goto('/settings')} title="Settings" /> */}
            {/* <Button onPress={() => props.goto('/onboarding')} title="Onboarding" />
            <Button onPress={() => props.goto('/firmware')} title="Firmware update" /> */}
        </View>
    );
};

const mapStateToProps = (state) => ({
    // state: state,
    devices: state,
})

const mapDispatchToProps = (dispatch) => ({
    goto: bindActionCreators(routerActions.goto, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(AccountsMenu);
