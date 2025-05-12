import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View, Dimensions, TouchableNativeFeedback  } from "react-native";
import { Text, TextInput, Button, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import * as Components from "../components";
import { useTheme } from 'react-native-paper';

const screenWidth = Dimensions.get("window").width;
type ScheduleScreenScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Schedule'>

export default function ScheduleScreen() {
    return(
        <View style={{flex:1}}>
        </View>
    )
}