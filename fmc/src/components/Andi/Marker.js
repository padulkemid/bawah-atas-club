import React, { Component } from "react";
import { View, Image, Text } from "react-native";

import MapView, { Circle, Marker, Polyline } from "react-native-maps";
import firebase from "react-native-firebase";

export default class Andi extends Component {
	constructor(props) {
		super(props);

		this.state = {
			markerAndi: {
				latitude: -6.973119,
				longitude: 107.633219
			},
			safezoneMarkerAndi: {
				latitude: -6.97298,
				longitude: 107.63308
			},
			safezoneAndi: {
				latitude: -6.97298,
				longitude: 107.63308
			},
			safezoneRadius: 10,
			positionAndi: "Outside Safezone"
		};
	}

	componentDidMount() {
		firebase
			.database()
			.ref("/maps/Andi/")
			.on("value", snapshot => {
				this.setState({
					markerAndi: {
						latitude: snapshot.val().markerLat,
						longitude: snapshot.val().markerLng
					},
					safezoneMarkerAndi: {
						latitude: snapshot.val().safezoneLat,
						longitude: snapshot.val().safezoneLng
					},
					safezoneAndi: {
						latitude: snapshot.val().safezoneLat,
						longitude: snapshot.val().safezoneLng
					},
					safezoneRadius: snapshot.val().safezoneRadius,
					positionAndi: snapshot.val().position
				});
			});
	}

	changeMarkerSelector = () => {
		firebase
			.database()
			.ref("/maps")
			.update({
				markerSelector: 1,
				addSelector: 1
			});
	};

	render() {
		return (
			<View>
				<Polyline
					coordinates={[
						{
							latitude: -6.973119,
							longitude: 107.633219
						},
						{
							latitude: this.state.markerAndi.latitude,
							longitude: this.state.markerAndi.longitude
						}
					]}
					strokeWidth={5}
					strokeColor="magenta"
				/>

				<Marker
					coordinate={this.state.markerAndi}
					title="Andi"
					description={this.state.positionAndi}
					onPress={this.changeMarkerSelector}
				>
					<Image
						source={require("../../image/jamur.png")}
						style={{ width: 30, height: 30 }}
					/>
				</Marker>

				<Marker
					coordinate={this.state.safezoneMarkerAndi}
					onDrag={val =>
						this.setState({
							safezoneAndi: {
								latitude: val.nativeEvent.coordinate.latitude,
								longitude: val.nativeEvent.coordinate.longitude
							}
						})
					}
					onDragEnd={val =>
						firebase
							.database()
							.ref("/maps/Andi/")
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
					center={this.state.safezoneAndi}
					radius={this.state.safezoneRadius}
					fillColor="rgba(176, 110, 226, 0.56)"
					strokeColor="rgba(108, 33, 166, 1)"
					strokeWidth={2}
				/>
			</View>
		);
	}
}
