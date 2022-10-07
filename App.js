import React, { Component, useEffect } from 'react';
import { Alert, BackHandler, PermissionsAndroid, Platform, StyleSheet, Text, ToastAndroid, TouchableOpacity, View } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import SplashScreen from 'react-native-splash-screen';

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      location: []
    };
  }

  componentDidMount() {
    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
    SplashScreen.hide();
    this.getLocationStart();
  }

  componentWillUnmount() {
    this.backHandler.remove();
  }

  hasLocationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version < 23) {
      return true;
    }
    const hasPermission = await PermissionsAndroid.check(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (hasPermission) {
      return true;
    }
    const status = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    if (status === PermissionsAndroid.RESULTS.GRANTED) {
      return true;
    }
    if (status === PermissionsAndroid.RESULTS.DENIED) {
      ToastAndroid.show(
        'User rejected the permission request',
        ToastAndroid.LONG,
      );
    } else if (status === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
      ToastAndroid.show(
        'User canceled the permission request',
        ToastAndroid.LONG,
      );
    }
    return false;
  };

  getLocationStart = async () => {
    this.setState({ location: await this.getLocation() });
  }

  getLocation = async () => {
    await this.hasLocationPermission();
    const promise = new Promise((resolve, reject) => {
      this.setState({ loading: true }, () => {
        Geolocation.getCurrentPosition(
          (position) => {
            resolve(position.coords);
          },
          (error) => {
            ToastAndroid.show(
              "Error: " + error.message,
              ToastAndroid.LONG,
            );
            resolve(error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 10000,
          }
        );
      });
    });
    const result = await promise;
    return result;
  };

  handleBackPress = () => {
    if (!this.state.Start_Scanner && !this.state.updatesEnabled) {
      Alert.alert(
        'Exit the application?',
        'Do you want to exit?',
        [
          { text: 'No', style: 'cancel' },
          {
            text: 'Yes', onPress: () => {
              BackHandler.exitApp()
            }
          },
        ],
        { cancelable: true });
    }
    return true;
  }

  render() {
    const {
      location
    } = this.state;
    return (
      <View style={styles.MainContainer}>
        <Text style={{ fontSize: 22, textAlign: 'center' }}>Welcome to Youloc!</Text>
        <Text style={{ fontSize: 18, textAlign: 'center' }}>Latitude: {location.latitude}</Text>
        <Text style={{ fontSize: 18, textAlign: 'center' }}>Longitude: {location.longitude}</Text>
        <TouchableOpacity
          onPress={this.getLocationStart}
          style={styles.button}>
          <Text style={{ color: '#FFF', fontSize: 14 }}>
            Refresh
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  MainContainer: {
    flex: 1,
    paddingTop: (Platform.OS) === 'ios' ? 20 : 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  QR_text: {
    color: '#000',
    fontSize: 19,
    padding: 8,
    marginTop: 12
  },
  button: {
    backgroundColor: '#2979FF',
    alignItems: 'center',
    padding: 12,
    width: 300,
    marginTop: 14
  },
  button_red: {
    backgroundColor: 'red',
    alignItems: 'center',
    padding: 12,
    width: 300,
    marginTop: 14
  },
});