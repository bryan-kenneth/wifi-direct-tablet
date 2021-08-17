
import React, { useState, useEffect } from 'react';

import { Button, PermissionsAndroid } from 'react-native';
import {
  getConnectionInfo,
  initialize,
  receiveMessage,
  removeGroup,
  sendMessage,
  startDiscoveringPeers,
  subscribeOnPeersUpdates,
  unsubscribeFromPeersUpdates,
} from 'react-native-wifi-p2p';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  Colors,
} from 'react-native/Libraries/NewAppScreen';
import Device from './Device';

/*
    APP COMPONENT
*/
const App = () => {

  const [devices, setDevices] = useState([])
  const [status, setStatus] = useState("status")

  const [message, setMessage] = useState("message")

  // Make sure location permission is granted
  useEffect(async () => {
    try {
      await initialize() // Initialize WiFi Direct
      // since it's required in Android >= 6.0
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
            'title': 'Access to wi-fi P2P mode',
            'message': 'ACCESS_FINE_LOCATION'
        }
      );

      subscribeOnPeersUpdates(handleNewPeers)

      return function cleanup() {
        unsubscribeFromPeersUpdates(handleNewPeers)
      }

    } catch (e) {
      console.error(e)
    }
  }, [])

  const startDiscovering = () => {
    startDiscoveringPeers()
      .then(status => setStatus(`Discovering: ${status}`))
      .catch(err => setStatus(`startDiscoveringPeers Error: ${err}`))
  }

  const handleNewPeers = ({ devices }) => {
    setDevices([...devices])
  }

  const sendHello = () => {
    getConnectionInfo()
    .then (() => {
      sendMessage('Hello from React Native!')
      .then(() => {
        // must wait for controller to reset socket
        setTimeout(() => {
          receiveMessage()
          .then(result => setMessage(result.message))
          .catch(err => setStatus(`receiveMessage Error: ${err}`))
        }, 500)
      })
    .catch(err => setStatus(`sendMessage Error: ${err}`))
    })
    
  }

  const sendCommand = () => {
    const commandObj = {
      command: "message",
      message: "Hello from React-Native..."
    }

    getConnectionInfo().then( () => {
      sendMessage(JSON.stringify(commandObj)).then( () => {
        setTimeout( () => {
          receiveMessage().then( result => {
            setMessage(result.message)
          })
        }, 1000)
      })
    })
  }

  const disconnect = () => {
    removeGroup()
    setStatus("status")
    setMessage("message")
  }

  return (
    <SafeAreaView style={Colors.lighter}>
      <StatusBar barStyle='light-content' />
        <View style={styles.container}>

          <Text>
            {status}
          </Text>

          <View style={styles.btn}>
            <Button style={styles.btn}
              title="Discover"
              onPress={startDiscovering}
            />
          </View>

          {devices.map((device, i) => 
            <Device key={`device#${i}`} device={device} />
          )}

          <View style={styles.btn}>
            <Button 
              title="Test Command"
              onPress={sendCommand}
            /> 
          </View>

          <View style={styles.btn}>
            <Button 
              title="Disconnect"
              onPress={disconnect}
            /> 
          </View>

          <Text>
            {message}
          </Text>
          
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 100,
    padding: 100,
    backgroundColor: '#EEEEEE',
  },
  btn: {
    paddingTop: 20,
    paddingBottom: 20,
  },
});

export default App;
