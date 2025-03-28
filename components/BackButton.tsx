import React from "react";
import {StyleSheet,View} from "react-native";
import { IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";

export default function BackButton() {
    const navigation = useNavigation();
    return (
        <IconButton
            icon="arrow-left"
            size={32}
            onPress={() => navigation.goBack()}
            style={authStyles.backButton}
            iconColor="#fff"
        />
    );
}
const authStyles = StyleSheet.create({
    backButton: {
        position: "absolute",
        top: 40,
        left: 20,
        backgroundColor: "#caa26a",
        borderRadius: 12,
    },
});
