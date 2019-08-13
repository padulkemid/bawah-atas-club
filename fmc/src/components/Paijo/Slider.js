import React, { Component } from "react";
import {
	StyleSheet,
	Text,
	View,
	Dimensions,
	TouchableOpacity,
	Slider
} from "react-native";

import firebase from "react-native-firebase";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

const { width, height } = Dimensions.get("window");

export default class SliderPaijo extends Component {
	constructor(props) {
		super(props);

		this.state = {
			safezoneRadius: 10
		};
	}

	submitSafezoneRadius = () => {
		let set = radius => {
			firebase
				.database()
				.ref("/maps/Paijo/")
				.update({
					safezoneRadius: radius
				});
		};
		set(this.state.safezoneRadius);
	};

	render() {
		return (
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
						value={this.state.safezoneRadius}
						onValueChange={val =>
							this.setState({ safezoneRadius: val })
						}
						onSlidingComplete={this.submitSafezoneRadius}
						thumbTintColor="magenta"
					/>
				</View>

				<View style={styles.rightCol}>
					<Text style={{ fontSize: 21, textAlign: "center" }}>
						{this.state.safezoneRadius}m
					</Text>
				</View>
			</TouchableOpacity>
		);
	}
}

const styles = StyleSheet.create({
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
	leftCol: {
		flex: 1,
		left: 10
	},
	centerCol: {
		flex: 4,
		left: 5
	},
	rightCol: {
		flex: 1,
		right: 7
	}
});
