import React, { Component } from "react";
import { View, Image, Text } from "react-native";

import MapView, { Circle, Marker, Polyline } from "react-native-maps";
import firebase from "react-native-firebase";

export default class Tukimin extends Component {
	constructor(props) {
		super(props);

		this.state = {
			markerTukimin: {
				latitude: -6.970111,
				longitude: 107.63086
			},
			safezoneMarkerTukimin: {
				latitude: -6.970643,
				longitude: 107.631364
			},
			safezoneTukimin: {
				latitude: -6.970643,
				longitude: 107.631364
			},
			safezoneRadius: 10,
			positionTukimin: "Outside Safezone"
		};
	}

	componentDidMount() {
		firebase
			.database()
			.ref("/maps/Tukimin/")
			.on("value", snapshot => {
				this.setState({
					markerTukimin: {
						latitude: snapshot.val().markerLat,
						longitude: snapshot.val().markerLng
					},
					safezoneMarkerTukimin: {
						latitude: snapshot.val().safezoneLat,
						longitude: snapshot.val().safezoneLng
					},
					safezoneTukimin: {
						latitude: snapshot.val().safezoneLat,
						longitude: snapshot.val().safezoneLng
					},
					safezoneRadius: snapshot.val().safezoneRadius,
					positionTukimin: snapshot.val().position
				});
			});
	}

	changeMarkerSelector = () => {
		firebase
			.database()
			.ref("/maps")
			.update({
				markerSelector: 3,
				addSelector: 3
			});
	};

	render() {
		return (
			<View>
				<Polyline
					coordinates={[
						{
							latitude: -6.970111,
							longitude: 107.63086
						},
						{
							latitude: this.state.markerTukimin.latitude,
							longitude: this.state.markerTukimin.longitude
						}
					]}
					strokeWidth={5}
					strokeColor="magenta"
				/>

				<Marker
					coordinate={this.state.markerTukimin}
					title="Tukimin"
					description={this.state.positionTukimin}
					onPress={this.changeMarkerSelector}
				>
					<Image
						source={require("../../image/jamur.png")}
						style={{ width: 30, height: 30 }}
					/>
				</Marker>

				<Marker
					coordinate={this.state.safezoneMarkerTukimin}
					onDrag={val =>
						this.setState({
							safezoneTukimin: {
								latitude: val.nativeEvent.coordinate.latitude,
								longitude: val.nativeEvent.coordinate.longitude
							}
						})
					}
					onDragEnd={val =>
						firebase
							.database()
							.ref("/maps/Tukimin/")
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
					center={this.state.safezoneTukimin}
					radius={this.state.safezoneRadius}
					fillColor="rgba(176, 110, 226, 0.56)"
					strokeColor="rgba(108, 33, 166, 1)"
					strokeWidth={2}
				/>
			</View>
		);
	}
}
