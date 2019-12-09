import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as routerActions from '../actions/routerActions';
import { Actions } from 'react-native-router-flux';

import Modal, { BottomModal, ModalContent, SlideAnimation } from 'react-native-modals';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
});

 const Page = (props: any) => {
    //console.log("PAGE", props.state)
    const [state, setState] = useState(false);

    useEffect(() => {
        console.log("Account MOUNT")
    }, []);

    useEffect(() => {
        return () => {
            console.log("Account UNMOUNT")
        }
    }, []);

    console.log("Account render", state)
    
    return (
        <View style={styles.container}>
            <Text>Account</Text>
            {/* <Button onPress={() => {
                console.log("OPEN MODAL!", Actions.deviceModal)
                Actions.deviceModal()
            }} title="Modal" /> */}
            {/* <Button onPress={() => props.goto('deviceModal')} title="Modal" /> */}
            <Button onPress={() => setState(true)} title="Modal2" />
            <BottomModal 
                visible={state}
                modalAnimation={new SlideAnimation({
                    slideFrom: 'bottom',
                })}
                onTouchOutside={() => setState(false)}>
                <ModalContent>
                    <Text>Account1</Text>
                </ModalContent>
            </BottomModal>
        </View>
    );
}

const mapStateToProps = (state) => ({
    state: state,
})

const mapDispatchToProps = (dispatch) => ({
    goto: bindActionCreators(routerActions.goto, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Page);