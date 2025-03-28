import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View, Dimensions } from "react-native";
import { Text, TextInput, Button, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { BarChart } from "react-native-chart-kit";
import type { RootStackParamList } from "../navigation/RootNavigator";
import * as Components from "../components";


type ProfileScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Profile'>

export default function ProfileScreen() {
    const navigation = useNavigation<ProfileScreenNavigationProp>();
    return (
        <View style={{flex: 1}}>
        {/* <Button mode="contained" onPress={() => navigation.goBack()}>
            <Text>
                Back
            </Text>
        </Button> */}
                    <Components.BottomNavBar activeRoute="Profile" />
        </View>
    )
}
export const styles = StyleSheet.create({
    profileicon: {
        backgroundColor: "#caa26a",
        borderRadius: 12,
    },
});