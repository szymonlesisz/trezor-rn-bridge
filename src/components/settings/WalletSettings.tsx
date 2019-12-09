import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as routerActions from '../../actions/routerActions';

 const Page = (props: any) => {
    //console.log("PAGE", props.state)

    useEffect(() => {
        console.log("PAGE MOUNT")
    }, []);

    useEffect(() => {
        return () => {
            console.log("PAGE UNMOUNT")
        }
    }, []);
    
    return (
        <View>
            <Text>Wallet settings</Text>
        </View>
    );
}

const mapDispatchToProps = (dispatch) => ({
    goto: bindActionCreators(routerActions.goto, dispatch),
})

export default connect(null, mapDispatchToProps)(Page);