
import React, { useState } from 'react';

import {
    connectWithConfig,
} from 'react-native-wifi-p2p'

import {
    StyleSheet,
    View,
    Text,
    Button,
} from 'react-native'

const Device = (props) => {

    const device = props.device

    const connect = () => {
        connectWithConfig({deviceAddress: device.deviceAddress, groupOwnerIntent: 0 })
      }

    return (
        <View style={styles.row}>
            <Text style={styles.text}>
                {`${device.deviceName} ${device.status == 0 ? '(Connected)' : ''}`}
            </Text>
            <View style={styles.button}>
                <Button 
                    title="connect"
                    onPress={connect}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    row: {
        backgroundColor: '#CCCCCC',
        flexDirection: "row",
        alignSelf: "center",
        paddingStart: 100,
        paddingEnd: 100,
        paddingTop: 20,
        paddingBottom: 20,
    },
    text: {
        flex: 1,
        textAlign: 'center',
        marginTop: 8,
        marginEnd: 10
    },
    button: {
        flex: 1,
        marginStart: 10,
        paddingStart: 10,
        paddingEnd: 10
    }
})

export default Device