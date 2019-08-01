import React, { Component } from "react";
import {
  StyleSheet,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  Image,
  Slider,
  PermissionsAndroid
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";

import MapView, {
  Circle,
  Marker,
  Polyline,
  AnimatedRegion,
  Animated,
  PROVIDER_GOOGLE
} from "react-native-maps";
import firebase from "react-native-firebase";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import Andi from "./src/components/Andi/Marker";
import SliderAndi from "./src/components/Andi/Slider";
import DistanceAndi from "./src/components/Andi/Distance";

import Paijo from "./src/components/Paijo/Marker";
import SliderPaijo from "./src/components/Paijo/Slider";
import DistancePaijo from "./src/components/Paijo/Distance";

import Tukimin from "./src/components/Tukimin/Marker";
import SliderTukimin from "./src/components/Tukimin/Slider";
import DistanceTukimin from "./src/components/Tukimin/Distance";

const { width, height } = Dimensions.get("window");

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      markerSelector: 1,
      addSelector: 1,
      region: {
        latitude: -6.970547,
        longitude: 107.632662,
        latitudeDelta: 0.0058,
        longitudeDelta: 0.005
      },
      markerAndi: true,
      propsAndi: {
        slider: false,
        distance: false
      },
      markerPaijo: true,
      propsPaijo: {
        slider: false,
        distance: false
      },
      markerTukimin: true,
      propsTukimin: {
        slider: false,
        distance: false
      },
      markerTest:{
        latitude: -6.97286,
        longitude: 107.632612,
      },
      markerTestProps: {
        slider: false,
        distance: false
      },
      safezoneMarkerTest: {
        latitude: -6.972445,
        longitude: 107.631988
      },
      safezoneTesting: {
        latitude: -6.972445,
        longitude: 107.631988
      },
      safezoneRadiusTesting: 50,
      distanceTesting: 0
    };
  }

  componentDidMount() {
    this.requestGeolocation();
    this.checkPermission();
    firebase
      .database()
      .ref("/maps/")
      .on("value", snapshot => {
        this.setState({
          addSelector: snapshot.val().addSelector,
          markerSelector: snapshot.val().markerSelector,
          markerAndi: snapshot.val().markerAndi,
          markerPaijo: snapshot.val().markerPaijo,
          markerTukimin: snapshot.val().markerTukimin
        });
        if (this.state.markerSelector === 1) {
          this.setState({
            propsPaijo: {
              slider: false,
              distance: false
            },
            propsTukimin: {
              slider: false,
              distance: false
            },
            markerTestProps: {
              slider: false,
              distance: false
            }
          }));
        } else if (this.state.markerSelector === 2) {
          this.setState({
            propsAndi: {
              slider: false,
              distance: false
            },
            propsTukimin: {
              slider: false,
              distance: false
            },
            markerTestProps: {
              slider: false,
              distance: false
            }
          }));
        } else if (this.state.markerSelector === 3) {
          this.setState({
            propsAndi: {
              slider: false,
              distance: false
            },
            propsPaijo: {
              slider: false,
              distance: false
            },
            markerTestProps: {
              slider: false,
              distance: false
            }
          }));
        } else if (this.state.markerSelector === 4) {
          this.setState({
            propsTukimin: {
              slider: false,
              distance: false
            },
            propsAndi: {
              slider: false,
              distance: false
            },
            propsPaijo: {
              slider: false,
              distance: false
            }
          }));
        }
      });

    firebase
      .database()
      .ref("/maps/")
      .update({
        addSelector: 2
      });

    firebase
      .database()
      .ref("/maps/Testing/")
      .on("value", snapshot => {
        this.setState({
          distanceTesting: snapshot.val().distance,
          safezoneRadiusTesting: snapshot.val().safezoneRadius
        });
      });

    this.watchID = navigator.geolocation.watchPosition(
      position => {

        this.setState({
          markerTest: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          }
        });

        firebase
          .database()
          .ref("/maps/Testing")
          .update({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
      },
      error => console.log(error),
      { enableHighAccuracy: true }
    );
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchID)
  }

  async requestGeolocation() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: "Izinkan Penggunaan GPS ?",
          message: "Geolocation dibutuhkan untuk pengujian alat.",
          buttonNegative: "Tidak",
          buttonPositive: "Ya"
        }
      );
      const ask = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      if (ask) {
        console.log("GPS Dibolehkan");
      } else {
        console.log("GPS Tidak Diperbolehkan");
      }
    } catch (error) {
      console.warn(error);
    }
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
    let fcmToken = await AsyncStorage.getItem("fcmToken");
    if (!fcmToken) {
      fcmToken = await firebase.messaging().getToken();
      if (fcmToken) {
        await AsyncStorage.setItem("fcmToken", fcmToken);
        console.log(fcmToken);
        firebase
          .database()
          .ref("/maps")
          .update({
            fcmToken: fcmToken
          });
      }
    }
  }

  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      this.getToken();
    } catch (error) {
      console.log("Ditolak, karena : ", error);
    }
  }

  showHide = () => {
    if (this.state.markerSelector === 1) {
      this.setState(prevState => ({
        propsAndi: {
          slider: !prevState.propsAndi.slider,
          distance: !prevState.propsAndi.distance
        },
        propsPaijo: {
          slider: false,
          distance: false
        },
        propsTukimin: {
          slider: false,
          distance: false
        },
        markerTestProps: {
          slider: false,
          distance: false
        }
      }));
    } else if (this.state.markerSelector === 2) {
      this.setState(prevState => ({
        propsPaijo: {
          slider: !prevState.propsPaijo.slider,
          distance: !prevState.propsPaijo.distance
        },
        propsAndi: {
          slider: false,
          distance: false
        },
        propsTukimin: {
          slider: false,
          distance: false
        },
        markerTestProps: {
          slider: false,
          distance: false
        }
      }));
    } else if (this.state.markerSelector === 3) {
      this.setState(prevState => ({
        propsTukimin: {
          slider: !prevState.propsTukimin.slider,
          distance: !prevState.propsTukimin.distance
        },
        propsAndi: {
          slider: false,
          distance: false
        },
        propsPaijo: {
          slider: false,
          distance: false
        },
        markerTestProps: {
          slider: false,
          distance: false
        }
      }));
    } else if (this.state.markerSelector === 4) {
      this.setState(prevState => ({
        markerTestProps: {
          slider: !prevState.markerTestProps.slider,
          distance: !prevState.markerTestProps.distance
        },
        propsTukimin: {
          slider: false,
          distance: false
        },
        propsAndi: {
          slider: false,
          distance: false
        },
        propsPaijo: {
          slider: false,
          distance: false
        }
      }));
    }
  };

  addMarker = () => {
    if (this.state.addSelector === 1) {
      firebase
        .database()
        .ref("/maps/")
        .update({
          addSelector: 2,
          markerAndi: true
        });
    } else if (this.state.addSelector === 2) {
      firebase
        .database()
        .ref("/maps/")
        .update({
          addSelector: 3,
          markerPaijo: true
        });
    } else if (this.state.addSelector === 3) {
      firebase
        .database()
        .ref("/maps/")
        .update({
          addSelector: 1,
          markerTukimin: true
        });
    }
  };

  deleteMarker = () => {
    if (this.state.markerSelector === 1) {
      firebase
        .database()
        .ref("/maps/")
        .update({
          addSelector: 2,
          markerAndi: false
        });
      this.setState({
        propsAndi: {
          slider: false,
          distance: false
        }
      });
    } else if (this.state.markerSelector === 2) {
      firebase
        .database()
        .ref("/maps/")
        .update({
          addSelector: 3,
          markerPaijo: false
        });
      this.setState({
        propsPaijo: {
          slider: false,
          distance: false
        }
      });
    } else if (this.state.markerSelector === 3) {
      firebase
        .database()
        .ref("/maps/")
        .update({
          addSelector: 1,
          markerTukimin: false
        });
      this.setState({
        propsTukimin: {
          slider: false,
          distance: false
        }
      });
    }
  };

  submitSafezoneRadius = () => {
    let set = radius => {
      firebase
        .database()
        .ref("/maps/Testing/")
        .update({
          safezoneRadius: radius
        });
    };
    set(this.state.safezoneRadiusTesting);
  };

  changeMarkerSelector = () => {
    firebase
      .database()
      .ref("/maps")
      .update({
        markerSelector: 4
      });
  };

  render() {
    return (
      <View style={styles.container}>
        {this.state.propsAndi.slider ? <SliderAndi /> : null}
        {this.state.propsPaijo.slider ? <SliderPaijo /> : null}
        {this.state.propsTukimin.slider ? <SliderTukimin /> : null}
        {this.state.markerTestProps.slider ? (
          <TouchableOpacity style={styles.sliderBg}>
            <View style={styles.leftCol}>
              <Icon
                name="map-marker-radius"
                size={33}
                color="black"
                style={{ alignSelf: "center" }}
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
                onValueChange={val =>
                  this.setState({ safezoneRadiusTesting: val })
                }
                onSlidingComplete={this.submitSafezoneRadius}
                thumbTintColor="magenta"
              />
            </View>

            <View style={styles.rightCol}>
              <Text style={{ fontSize: 21, textAlign: "center" }}>
                {this.state.safezoneRadiusTesting}m
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

        <MapView
          initialRegion={this.state.region}
          showsUserLocation={true}
          followUserLocation={true}
          showsMyLocationButton={true}
          rotateEnabled={false}
          style={{ flex: 1 }}
          ref={map => {
            this.map = map;
          }}
        >
          {this.state.markerAndi ? <Andi /> : null}
          {this.state.markerPaijo ? <Paijo /> : null}
          {this.state.markerTukimin ? <Tukimin /> : null}

          <Marker.Animated
            ref={marker => {
              this.marker = marker;
            }}
            coordinate={this.state.markerTest}
            onPress={this.changeMarkerSelector}
            title="Anda"
            description="Geolokasi GPS"
          >
            <Image
              source={require("./src/image/jamur.png")}
              style={{ width: 30, height: 30 }}
            />
          </Marker.Animated>
          <Circle
            center={this.state.safezoneTesting}
            radius={this.state.safezoneRadiusTesting}
            fillColor="rgba(176, 110, 226, 0.56)"
            strokeColor="rgba(108, 33, 166, 1)"
            strokeWidth={2}
          />
          <Marker
            coordinate={this.state.safezoneMarkerTest}
            onDrag={val =>
              this.setState({
                safezoneTesting: {
                  latitude: val.nativeEvent.coordinate.latitude,
                  longitude: val.nativeEvent.coordinate.longitude
                }
              })
            }
            onDragEnd={val =>
              firebase
                .database()
                .ref("/maps/Testing/")
                .update({
                  safezoneLat: val.nativeEvent.coordinate.latitude,
                  safezoneLng: val.nativeEvent.coordinate.longitude
                })
            }
            draggable
          >
            <Image
              source={require("./src/image/bunga.png")}
              style={{ width: 30, height: 30 }}
            />
          </Marker>
        </MapView>

        <TouchableOpacity
          style={styles.minusButton}
          onPress={this.deleteMarker}
        >
          <Icon
            name="map-marker-minus"
            size={33}
            color="black"
            style={{ left: 13 }}
          />
        </TouchableOpacity>
        <TouchableOpacity style={styles.plusButton} onPress={this.addMarker}>
          <Icon
            name="map-marker-plus"
            size={33}
            color="black"
            style={{ left: 13 }}
          />
        </TouchableOpacity>
        {this.state.propsAndi.distance ? <DistanceAndi /> : null}
        {this.state.propsPaijo.distance ? <DistancePaijo /> : null}
        {this.state.propsTukimin.distance ? <DistanceTukimin /> : null}
        {this.state.markerTestProps.distance ? (
          <TouchableOpacity style={styles.distanceBg}>
            <View style={styles.leftCol}>
              <Icon
                name="run"
                size={33}
                color="black"
                style={{ alignSelf: "center" }}
              />
            </View>

            <View style={styles.centerCol}>
              <Text style={{ textAlign: "center", fontSize: 21 }}>
                {this.state.distanceTesting} m
              </Text>
            </View>
          </TouchableOpacity>
        ) : null}

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
    backgroundColor: "white"
  },
  minusButton: {
    zIndex: 9,
    position: "absolute",
    flexDirection: "row",
    width: width - 355,
    height: 56,
    bottom: 20,
    left: 20,
    borderRadius: 50,
    backgroundColor: "white",
    alignItems: "center",
    shadowColor: "black",
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1
  },
  plusButton: {
    zIndex: 9,
    position: "absolute",
    flexDirection: "row",
    width: width - 355,
    height: 56,
    bottom: 20,
    left: 90,
    borderRadius: 50,
    backgroundColor: "white",
    alignItems: "center",
    shadowColor: "black",
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1
  },
  sliderButton: {
    zIndex: 9,
    position: "absolute",
    flexDirection: "row",
    width: width - 355,
    height: 56,
    bottom: 20,
    right: 20,
    borderRadius: 50,
    backgroundColor: "white",
    alignItems: "center",
    shadowColor: "black",
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1
  },
  distanceBg: {
    zIndex: 9,
    position: "absolute",
    flexDirection: "row",
    width: width - 250,
    height: 60,
    bottom: 20,
    right: 90,
    borderRadius: 2,
    backgroundColor: "white",
    alignItems: "center",
    shadowColor: "black",
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1
  },
  leftCol: {
    flex: 1,
    left: 10
  },
  centerCol: {
    flex: 4,
    left: 5
  },
  sliderBg: {
    zIndex: 9,
    position: "absolute",
    flexDirection: "row",
    width: width - 40,
    height: 60,
    top: 20,
    left: 20,
    borderRadius: 2,
    backgroundColor: "white",
    alignItems: "center",
    shadowColor: "black",
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1
  },
  rightCol: {
    flex: 1,
    right: 7
  }
});
