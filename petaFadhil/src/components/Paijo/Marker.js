import React, { Component } from "react";
import { View, Image, Text } from "react-native";

import MapView, { Circle, Marker, Polyline } from "react-native-maps";
import firebase from "react-native-firebase";

export default class Paijo extends Component {
	constructor(props) {
		super(props);

		this.state = {
			markerPaijo: {
				latitude: -6.970701,
				longitude: 107.633597
			},
			safezoneMarkerPaijo: {
				latitude: -6.970126,
				longitude: 107.633898
			},
			safezonePaijo: {
				latitude: -6.970126,
				longitude: 107.633898
			},
			safezoneRadius: 10,
			positionPaijo: "Outside Safezone"
		};
	}

	componentDidMount() {
		firebase
			.database()
			.ref("/maps/Paijo/")
			.on("value", snapshot => {
				this.setState({
					markerPaijo: {
						latitude: snapshot.val().markerLat,
						longitude: snapshot.val().markerLng
					},
					safezoneMarkerPaijo: {
						latitude: snapshot.val().safezoneLat,
						longitude: snapshot.val().safezoneLng
					},
					safezonePaijo: {
						latitude: snapshot.val().safezoneLat,
						longitude: snapshot.val().safezoneLng
					},
					safezoneRadius: snapshot.val().safezoneRadius,
					positionPaijo: snapshot.val().position
				});
			});
	}

	changeMarkerSelector = () => {
		firebase
			.database()
			.ref("/maps")
			.update({
				markerSelector: 2,
				addSelector: 2
			});
	};

	render() {
		return (
			<View>
				<Polyline
					coordinates={[
						{
							latitude: -6.970701,
							longitude: 107.633597
						},
						{
							latitude: this.state.markerPaijo.latitude,
							longitude: this.state.markerPaijo.longitude
						}
					]}
					strokeWidth={5}
					strokeColor="magenta"
				/>

				<Marker
					coordinate={this.state.markerPaijo}
					title="Paijo"
					description={this.state.positionPaijo}
					onPress={this.changeMarkerSelector}
				>
					<Image
						source={require("../../image/jamur.png")}
						style={{ width: 30, height: 30 }}
					/>
				</Marker>

				<Marker
					coordinate={this.state.safezoneMarkerPaijo}
					onDrag={val =>
						this.setState({
							safezonePaijo: {
								latitude: val.nativeEvent.coordinate.latitude,
								longitude: val.nativeEvent.coordinate.longitude
							}
						})
					}
					onDragEnd={val =>
						firebase
							.database()
							.ref("/maps/Paijo/")
							.update({
								safezoneLat:
									val.nativeEvent.coordinate.latitude,
								safezoneLng:
									val.nativeEvent.coordinate.longitude
							})
					}
					draggable
				>
					<Image
						source={require("../../image/bunga.png")}
						style={{ width: 30, height: 30 }}
					/>
				</Marker>

				<Circle
					center={this.state.safezonePaijo}
					radius={this.state.safezoneRadius}
					fillColor="rgba(176, 110, 226, 0.56)"
					strokeColor="rgba(108, 33, 166, 1)"
					strokeWidth={2}
				/>
			</View>
		);
	}
}
