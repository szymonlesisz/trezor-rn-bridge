import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Modal, { ModalContent, SlideAnimation } from 'react-native-modals';
import * as routerActions from '../../actions/routerActions';
import ConnectDevice from '../ConnectDevice';
import styles from '../styles';


const Page = (props: any) => {
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
            <Text style={styles.h1}>Send BTC</Text>
            <Button onPress={() => setState(true)} title="Send transaction" />
            <Modal 
                visible={state}
                modalAnimation={new SlideAnimation({
                    slideFrom: 'left',
                })}
                swipeDirection={['up', 'down']} // can be string or an array
                swipeThreshold={200} // default 100
                onSwipeOut={() => setState(false)}>
                <ModalContent>
                    <Text>Tx details. Confirm on device</Text>
                </ModalContent>
            </Modal>
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