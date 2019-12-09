import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Modal, { ModalFooter, ModalButton, ModalTitle, ModalContent, SlideAnimation } from 'react-native-modals';
import * as routerActions from '../../actions/routerActions';
import ConnectDevice from '../ConnectDevice';
import styles from '../styles';


const Page = (props: any) => {
    const [state, setState] = useState(false);
    return (
        <View style={styles.container}>
            <Text style={styles.h1}>Sign message</Text>
            <Button onPress={() => setState(true)} title="Sign" />
            <Modal 
                visible={state}
                modalAnimation={new SlideAnimation({
                    slideFrom: 'top',
                })}
                modalTitle={<ModalTitle title="Sign message" />}
                footer={
                    <ModalFooter>
                      <ModalButton text="CANCEL" onPress={() => setState(false)} />
                      <ModalButton text="OK" onPress={() => setState(false)} />
                    </ModalFooter>
                }
                swipeDirection={['left', 'right']}
                swipeThreshold={200} // default 100
                onSwipeOut={() => setState(false)}>
                <ModalContent style={{ width: 300 }}>
                    <Text>Confirm on device</Text>
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