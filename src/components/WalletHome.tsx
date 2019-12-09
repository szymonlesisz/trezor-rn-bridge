import React from 'react';
import { View, Text, Button } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as routerActions from '../actions/routerActions';
import styles from './styles';

 const Wallet = (props: any) => (
    <View style={styles.container}>
        <Text style={styles.h1}>Wallet homepage</Text>
        <Text>Not sure what is going to be here... List of all accounts?</Text>
        <View style={{ margin: 20 }}>
            <Button onPress={() => props.goto('/wallet/account')} title="Go to account details" />
        </View>
    </View>
);

const mapDispatchToProps = (dispatch) => ({
    goto: bindActionCreators(routerActions.goto, dispatch),
})

export default connect(null, mapDispatchToProps)(Wallet);
