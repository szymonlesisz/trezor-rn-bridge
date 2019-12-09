import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as routerActions from '../actions/routerActions';
import { Actions } from 'react-native-router-flux';

 const Onboarding = (props: any) => {
    //console.log("PAGE", props.state)

    useEffect(() => {
        console.log("Onboarding MOUNT", )
        // Actions.refresh({
        //     drawerLockMode: 'locked-closed',
        // })

    }, []);

    useEffect(() => {
        return () => {
            console.log("Onboarding UNMOUNT")
        }
    }, []);

    console.log("ONB RENDER", props.state.navigator)
    
    return (
        <View>
            <Text>Onboarding</Text>
            <Button onPress={() => props.goto('/')} title="Home">Home</Button>
        </View>
    );
}


const mapStateToProps = (state) => ({
    state: state,
})

const mapDispatchToProps = (dispatch) => ({
    goto: bindActionCreators(routerActions.goto, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Onboarding);