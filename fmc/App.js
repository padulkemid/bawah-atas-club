import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  Image,
  Slider,
  PermissionsAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import MapView, {
  Circle,
  Marker,
  Polyline,
  AnimatedRegion,
  Animated,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import firebase from 'react-native-firebase';
import type { Notification, NotificationOpen } from 'react-native-firebase';

const { width, height } = Dimensions.get('window');

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      region: {
        latitude: -6.970547,
        longitude: 107.632662,
        latitudeDelta: 0.0058,
        longitudeDelta: 0.005,
      },
      markerTest: {
        latitude: -6.97286,
        longitude: 107.632612,
      },
      safezoneMarkerTest: {
        latitude: -6.972445,
        longitude: 107.631988,
      },
      safezoneTesting: {
        latitude: -6.972445,
        longitude: 107.631988,
      },
      markerTestTrack: {
        latitude: -6.97286,
        longitude: 107.632612,
      },
      safezoneRadiusTesting: 50,
      distanceTesting: 0,
    };
  }

  componentDidMount() {
    this.requestPermission();
    this.createNotificationListeners();
    firebase
      .database()
      .ref('/maps/TestingRaps/')
      .on('value', (snapshot) => {
        this.setState({
          distanceTesting: snapshot.val().distance,
          safezoneRadiusTesting: snapshot.val().safezoneRadius,
          safezoneMarkerTest: {
            latitude: snapshot.val().safezoneLat,
            longitude: snapshot.val().safezoneLng,
          },
          safezoneTesting: {
            latitude: snapshot.val().safezoneLat,
            longitude: snapshot.val().safezoneLng,
          },
          markerTestTrack: {
            latitude: snapshot.val().latDistanceStart,
            longitude: snapshot.val().lngDistanceStart,
          },
        });
      });

    firebase
      .database()
      .ref('/maps/Testing')
      .on('value', (snapshot) => {
        this.setState({
          markerTest: {
            latitude: snapshot.val().latitude,
            longitude: snapshot.val().longitude,
          },
        });
      });
  }

  componentWillUnmount() {
    this.notificationListener();
  }

  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      this.getToken();
    } else {
      this.requestPermission();
    }
  }

  async getToken() {
    let fcmToken = await AsyncStorage.getItem('fcmToken');
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        await AsyncStorage.setItem('fcmToken', fcmToken);
        console.log('token baru :', fcmToken);
        firebase
          .database()
          .ref('/maps')
          .update({
            fcmToken: fcmToken,
          });
      }
    } else {
      console.log('token lama :', fcmToken);
      firebase
        .database()
        .ref('/maps')
        .update({
          fcmToken: fcmToken,
        });
    }
  }

  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      this.getToken();
    } catch (error) {
      console.log('Ditolak, karena : ', error);
    }
  }

  async createNotificationListeners() {
    const channel = new firebase.notifications.Android.Channel(
      'Find My Children',
      'Notifications',
      firebase.notifications.Android.Importance.Max
    )
      .enableVibration(true)
      .setVibrationPattern([500, 500])
      .setLightColor('magenta')
      .setDescription('All Notifications');
    firebase.notifications().android.createChannel(channel);

    this.notificationListener = firebase.notifications().onNotification((notification) => {
      console.log('onNotification notification-->', notification);
      console.log('onNotification notification.data -->', notification.data);
      console.log('onNotification notification.notification -->', notification.notification);
      this.displayNotification(notification);
    });
  }

  displayNotification = (notification) => {
    const localNotification = new firebase.notifications.Notification({
      sound: 'default',
      show_in_foreground: true,
    })
      .setNotificationId(notification.notificationId)
      .setTitle(notification.title)
      .setSubtitle(notification.subtitle)
      .setData(notification.data)
      .setBody(notification.body)
      .android.setChannelId('Find My Children')
      .android.setSmallIcon('ic_stat_ic_notification')
      .android.setPriority(firebase.notifications.Android.Priority.High);

    firebase
      .notifications()
      .displayNotification(localNotification)
      .catch((err) => console.error(err));
  };

  submitCoordsDistance(dist) {
    firebase
      .database()
      .ref('/maps/TestingRaps')
      .update({
        latDistanceStart: dist.nativeEvent.coordinate.latitude,
        lngDistanceStart: dist.nativeEvent.coordinate.longitude,
      });
  }

  submitSafezoneRadius = () => {
    let set = (radius) => {
      firebase
        .database()
        .ref('/maps/TestingRaps/')
        .update({
          safezoneRadius: radius,
        });
    };
    set(this.state.safezoneRadiusTesting);
  };

  render() {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.sliderBg}>
          <View style={styles.leftCol}>
            <Icon
              name="map-marker-radius"
              size={33}
              color="black"
              style={{ alignSelf: 'center' }}
            />
          </View>

          <View style={styles.centerCol}>
            <Slider
              minimumTrackTintColor="magenta"
              maximumTrackTintColor="darkmagenta"
              step={5}
              minimumValue={10}
              maximumValue={100}
              value={this.state.safezoneRadiusTesting}
              onValueChange={(val) => this.setState({ safezoneRadiusTesting: val })}
              onSlidingComplete={this.submitSafezoneRadius}
              thumbTintColor="magenta"
            />
          </View>

          <View style={styles.rightCol}>
            <Text style={{ fontSize: 21, textAlign: 'center' }}>
              {this.state.safezoneRadiusTesting}m
            </Text>
          </View>
        </TouchableOpacity>

        <MapView
          initialRegion={this.state.region}
          showsUserLocation={false}
          followUserLocation={true}
          showsMyLocationButton={true}
          rotateEnabled={false}
          style={{ flex: 1 }}
          ref={(map) => {
            this.map = map;
          }}>
          <Marker
            ref={(marker) => {
              this.marker = marker;
            }}
            coordinate={this.state.markerTest}
            onPress={(val) => this.submitCoordsDistance(val)}
            title="Rapael"
            description="Geolokasi Alat">
            <Image source={require('./src/image/jamur.png')} style={{ width: 30, height: 30 }} />
          </Marker>
          <Circle
            center={this.state.safezoneTesting}
            radius={this.state.safezoneRadiusTesting}
            fillColor="rgba(176, 110, 226, 0.56)"
            strokeColor="rgba(108, 33, 166, 1)"
            strokeWidth={2}
          />
          <Marker
            coordinate={this.state.safezoneMarkerTest}
            onDrag={(val) =>
              this.setState({
                safezoneTesting: {
                  latitude: val.nativeEvent.coordinate.latitude,
                  longitude: val.nativeEvent.coordinate.longitude,
                },
              })
            }
            onDragEnd={(val) =>
              firebase
                .database()
                .ref('/maps/TestingRaps/')
                .update({
                  safezoneLat: val.nativeEvent.coordinate.latitude,
                  safezoneLng: val.nativeEvent.coordinate.longitude,
                })
            }
            draggable>
            <Image source={require('./src/image/bunga.png')} style={{ width: 30, height: 30 }} />
          </Marker>
        </MapView>

        <TouchableOpacity style={styles.minusButton} onPress={this.deleteMarker}>
          <Icon name="map-marker-minus" size={33} color="black" style={{ left: 13 }} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.plusButton} onPress={this.addMarker}>
          <Icon name="map-marker-plus" size={33} color="black" style={{ left: 13 }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.distanceBg}>
          <View style={styles.leftCol}>
            <Icon name="run" size={33} color="black" style={{ alignSelf: 'center' }} />
          </View>

          <View style={styles.centerCol}>
            <Text style={{ textAlign: 'center', fontSize: 21 }}>
              {this.state.distanceTesting} m
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sliderButton} onPress={this.showHide}>
          <Icon name="settings" size={33} color="black" style={{ left: 13 }} />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  minusButton: {
    zIndex: 9,
    position: 'absolute',
    flexDirection: 'row',
    width: width - 355,
    height: 56,
    bottom: 20,
    left: 20,
    borderRadius: 50,
    backgroundColor: 'white',
    alignItems: 'center',
    shadowColor: 'black',
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1,
  },
  plusButton: {
    zIndex: 9,
    position: 'absolute',
    flexDirection: 'row',
    width: width - 355,
    height: 56,
    bottom: 20,
    left: 90,
    borderRadius: 50,
    backgroundColor: 'white',
    alignItems: 'center',
    shadowColor: 'black',
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1,
  },
  sliderButton: {
    zIndex: 9,
    position: 'absolute',
    flexDirection: 'row',
    width: width - 355,
    height: 56,
    bottom: 20,
    right: 20,
    borderRadius: 50,
    backgroundColor: 'white',
    alignItems: 'center',
    shadowColor: 'black',
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1,
  },
  distanceBg: {
    zIndex: 9,
    position: 'absolute',
    flexDirection: 'row',
    width: width - 250,
    height: 60,
    bottom: 20,
    right: 90,
    borderRadius: 2,
    backgroundColor: 'white',
    alignItems: 'center',
    shadowColor: 'black',
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1,
  },
  leftCol: {
    flex: 1,
    left: 10,
  },
  centerCol: {
    flex: 4,
    left: 5,
  },
  sliderBg: {
    zIndex: 9,
    position: 'absolute',
    flexDirection: 'row',
    width: width - 40,
    height: 60,
    top: 20,
    left: 20,
    borderRadius: 2,
    backgroundColor: 'white',
    alignItems: 'center',
    shadowColor: 'black',
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1,
  },
  rightCol: {
    flex: 1,
    right: 7,
  },
});
