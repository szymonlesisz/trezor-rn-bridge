import React from 'react';
import { View, Text, Button } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as routerActions from '../actions/routerActions';
import styles from './styles';

 const Home = (props: any) => (
    <View style={styles.container}>
        <Text style={styles.h1}>Initial run</Text>
        <Text>What is your intention?</Text>
        <View style={{ margin: 20 }}>
            <Button onPress={() => props.goto('/onboarding')} title="I'm new. Start onboarding" />
        </View>
        <Button color='gray' onPress={() => props.goto('/')} title="I want to use suite now" />
    </View>
);

const mapDispatchToProps = (dispatch) => ({
    goto: bindActionCreators(routerActions.goto, dispatch),
})

export default connect(null, mapDispatchToProps)(Home);
