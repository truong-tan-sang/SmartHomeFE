import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View, Dimensions, TouchableNativeFeedback  } from "react-native";
import { Text, TextInput, Button, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import * as Components from "../components";
import { useTheme } from 'react-native-paper';

const screenWidth = Dimensions.get("window").width;
type ElecControlScreenScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ElecControl'>

export default function ElecControlScreen() {
    const { colors } = useTheme();

    const navigation = useNavigation<ElecControlScreenScreenNavigationProp>();

    // Thêm type cho các thiết bị
    type DeviceType = "fan" | "light" | "curtain" | "ac";
    const [devices, setDevices] = useState({
        fan: false,
        light: false,
        curtain: false,
        ac: false,
    });

    const toggleDevice = (device: DeviceType) => {
        setDevices(prev => ({ ...prev, [device]: !prev[device] }));
    };

    // Component button điều khiển
    const DeviceButton = ({
        icon,
        label,
        isActive,
        onPress,
    }: {
        icon: string;
        label: string;
        isActive: boolean;
        onPress: () => void;
    }) => (
        <TouchableNativeFeedback
            onPress={onPress} // Bỏ style ở đây vì không có tác dụng
        >
            <View style={[styles.deviceButton, isActive && styles.activeDevice]}>
                <IconButton
                    icon={icon}
                    size={32}
                    iconColor={isActive ? "#fff" : "#caa26a"}
                />
                <Text style={{
                    color: "#fff", // Màu luôn trắng theo code của bạn
                    marginTop: 2,
                    fontWeight: "regular",
                    fontSize: 15
                }}>
                    {label}
                </Text>
            </View>
        </TouchableNativeFeedback>
    );
    return (
        <View style={{ flex: 1 }}>
            {/* <Components.BackButton />
            <View style={{ margin: 50 }}>
                <IconButton
                    icon="account"
                    size={32}
                    onPress={() => navigation.navigate("Profile")}
                    style={styles.profileicon}
                    iconColor="#fff"
                />
            </View> */}
            <Components.BarChart />

            {/* Grid điều khiển 2x2 */}
            <View style={styles.gridContainer}>
                <DeviceButton
                    icon="google-circles-extended"
                    label="Quạt"
                    isActive={devices.fan}
                    onPress={() => toggleDevice("fan")}
                />
                <DeviceButton
                    icon="lightbulb-outline"
                    label="Đèn"
                    isActive={devices.light}
                    onPress={() => toggleDevice("light")}
                />
                <DeviceButton
                    icon="blinds"
                    label="Rèm"
                    isActive={devices.curtain}
                    onPress={() => toggleDevice("curtain")}
                />
                <DeviceButton
                    icon="air-conditioner"
                    label="Điều hòa"
                    isActive={devices.ac}
                    onPress={() => toggleDevice("ac")}
                />
            </View>
            <Components.BottomNavBar activeRoute="ElecControl" />
        </View>
    );
    
};

export const styles = StyleSheet.create({
    profileicon: {
        backgroundColor: "#caa26a",
        borderRadius: 12,
    },
    container: {
        flex: 1,
        paddingBottom: 60, // Để tránh bị navigation bar đè lên
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    gridContainer: {
        flexDirection: "row",
        // padding: 20,
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 20,
        marginHorizontal: 63,

    },
    deviceButton: {
        width: 120,
        height: 120,
        alignItems: "center",
        padding: 16,
        marginVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        // borderColor: "#1B1A18",
        backgroundColor: "#1B1A18",
    },
    activeDevice: {
        // backgroundColor: "#caa26a",
        // borderColor: "#caa26a",
    },

});