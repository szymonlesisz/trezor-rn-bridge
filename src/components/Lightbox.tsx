import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Button } from 'react-native';
import { Actions } from 'react-native-router-flux';
import Lightbox from './BaseLightbox';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    // backgroundColor: 'transparent',
    backgroundColor: 'rgba(52,52,52,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const BaseLightbox = (props: any) => {

    const { verticalPercent, horizontalPercent } = props;
    const { height: deviceHeight, width: deviceWidth } = Dimensions.get('window');
    const height = verticalPercent ? deviceHeight * verticalPercent : deviceHeight;
    const width = horizontalPercent ? deviceWidth * horizontalPercent : deviceWidth;

    return (
        <View style={styles.container}>
            <View
                style={{
                        width,
                        height,
                        justifyContent: 'center',
                        alignItems: 'center',
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderWidth: 1,
                        borderColor: 'red',
                    }}
            >
                {props.children}
            </View>
        </View>
    )
}

const DemoLightbox = ({ data, children }) => (
    <BaseLightbox verticalPercent={0.5} horizontalPercent={0.9}>
        <Text>Demo Lightbox: {data}</Text>
        <Text>Allows transparency for background</Text>
    </BaseLightbox>
);

export default DemoLightbox;