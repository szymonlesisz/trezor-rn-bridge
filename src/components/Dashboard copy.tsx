import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as routerActions from '../actions/routerActions';
import styles from './styles';

 const Home = (props: any) => {
    console.log("HOME", Object.keys(props))
    console.log("HOME", props.name)
    console.log("HOME", props.drawerLockMode)
    console.log("HOME", Object.keys(props.navigation.dangerouslyGetParent()))
    // console.log("HOME", Object.keys(props.navigation))

    useEffect(() => {
        console.log("HOME MOUNT")
        

        // Actions.refresh({
        //     hideNavBar: true,
        //     drawerLockMode: 'locked-closed',
        //     gesturesEnabled: false,
        // });

        // props.navigation.setParams({
        //     hideNavBar: true,
        //     drawerLockMode: 'locked-closed',
        //     gesturesEnabled: false,
        // });
        // props.navigation.dismiss();
        // Actions.refresh({
        //     // hideNavBar: true,
        //     drawerLockMode: 'locked-closed',
        //     gesturesEnabled: false,
        // }, props.name);
    }, []);

    useEffect(() => {
        return () => {
            console.log("HOME UNMOUNT")
        }
    }, []);

    console.log("HOME RENDER!")

    return (
        <View style={styles.container}>
            <Text style={styles.h1}>Dashboard</Text>
            <Button onPress={() => props.goto('/onboarding')} title="Start onboarding" />
            <Button onPress={() => props.goto('/wallet')} title="Goto Wallet" />
        </View>
    );
}

// const mapStateToProps = (state) => ({
//     state2: state,
// })

const mapDispatchToProps = (dispatch) => ({
    goto: bindActionCreators(routerActions.goto, dispatch),
})

export default connect(null, mapDispatchToProps)(Home);