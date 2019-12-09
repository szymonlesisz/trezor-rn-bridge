import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as routerActions from '../../actions/routerActions';

const StyledButton = (props: any) => {
    return (
        <View style={{ margin: 5 }}>
            <Button {...props} />
        </View>
    )
}

const AccountsMenu = (props: any) => {
    return (
        <View>
             <View style={{ margin: 5, marginBottom: 20 }}>
                <Button onPress={() => props.goto('/device-select')} title="My Trezor (device)" />
            </View>
            <Text>Application Menu</Text>
            <StyledButton onPress={() => props.goto('/')} title="Dashboard" />
            <StyledButton onPress={() => props.goto('/wallet')} title="Wallet" />
            <StyledButton onPress={() => props.goto('/exchange')} title="Exchange" />
            <StyledButton onPress={() => props.goto('/passwords')} title="Passwords" />
            <StyledButton onPress={() => props.goto('/settings')} title="Settings" />
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
