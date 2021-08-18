
import React, { useState, useEffect } from 'react';

import { Button, PermissionsAndroid } from 'react-native';
import {
  getConnectionInfo,
  initialize,
  receiveMessage,
  removeGroup,
  sendFile,
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

import Device from './Device';

import { Colors } from 'react-native/Libraries/NewAppScreen';

import DocumentPicker from 'react-native-document-picker'

import RNFetchBlob from 'rn-fetch-blob'

/*
    APP COMPONENT
*/
const App = () => {

  const [devices, setDevices] = useState([])
  const [status, setStatus] = useState("status")

  const [message, setMessage] = useState("message")
  const [path, setPath] = useState("path")
  const [fname, setFname] = useState("fileName")

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

  const sendCommand = () => {
    const commandObj = {
      command: "test message",
      message: "Testing, testing, 1 2 3"
    }

    getConnectionInfo().then( () => {
      sendMessage(JSON.stringify(commandObj)).then( () => {
        setTimeout( () => { // must wait for controller to reset socket
          receiveMessage().then( result => {
            setMessage(result.message)
          })
        }, 1000)
      })
    })
  }

  const selectFile = async () => {
    try {
      const res = await DocumentPicker.pick({
        type: ["application/x-pem-file"]
      })
      setFname(res[0].name)
      // Get path from uri
      RNFetchBlob.fs.stat(res[0].uri).then( stats => {
        setPath(`${stats.path}`)
      })
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled selectFile
      } else {
        throw err
      }
    }
  }

  const sendCertificate = () => {
    const commandObj = {
      command: "install certificate",
      fileName: fname
    }

    getConnectionInfo().then( () => {
      sendMessage(JSON.stringify(commandObj)).then( () => {
        setTimeout( () => {
          sendFile(path).then( () => {
            setTimeout( () => {
              receiveMessage().then( result => {
                // handle response
                setMessage(result.message)
              })
            }, 1000)
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

          <View style={styles.btn}>
            <Button style={styles.btn}
              title="Select File"
              onPress={selectFile}
            />
          </View>

          <Text>{`name: ${fname} path: ${path}`}</Text>

          {devices.map((device, i) => 
            <Device key={`device#${i}`} device={device} />
          )}

          <View style={styles.btn}>
            <Button 
              title="Send Certificate"
              onPress={sendCertificate}
            /> 
          </View>

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
    padding: 100,
    backgroundColor: '#EEEEEE',
  },
  btn: {
    paddingTop: 20,
    paddingBottom: 20,
  },
});

export default App;
