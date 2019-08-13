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

export default class DistanceTukimin extends Component {
	constructor(props) {
		super(props);

		this.state = {
			distanceTukimin: 0
		};
	}

	componentDidMount() {
		firebase
			.database()
			.ref("/maps/Tukimin/distance")
			.on("value", snapshot => {
				this.setState({
					distanceTukimin: snapshot.val()
				});
			});
	}

	render() {
		return (
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
						{this.state.distanceTukimin} m
					</Text>
				</View>
			</TouchableOpacity>
		);
	}
}

const styles = StyleSheet.create({
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
	}
});
