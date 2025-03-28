import React from "react";
import { View, StyleSheet, TouchableOpacity} from "react-native";
import { IconButton , Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/RootNavigator";

type NavBarProps = {
    activeRoute?: string;
};

const BottomNavBar = ({ activeRoute }: NavBarProps) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={() => navigation.navigate("SmartHome")}>
                <View style={styles.navItem}>
                    <IconButton
                        style={styles.button}
                        icon={activeRoute === "SmartHome" ? "home" : "home-outline"}
                        mode={activeRoute === "SmartHome" ? "contained" : undefined}
                        size={32}
                        containerColor={activeRoute === "SmartHome" ? "#dac297" : "transparent"}
                        iconColor='#faf7f2'
                    />
                    <Text style={styles.label}>Trang chủ</Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
                <View style={styles.navItem}>
                    <IconButton
                        style={styles.button}
                        icon={activeRoute === "Profile" ? "account" : "account-outline"}
                        mode={activeRoute === "Profile" ? "contained" : undefined}
                        size={32}
                        containerColor={activeRoute === "Profile" ? "#dac297" : "transparent"}
                        iconColor='#faf7f2'
                    />
                    <Text style={styles.label}>Hồ sơ</Text>
                </View>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#caa26a",
        paddingVertical: 8,
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
    navItem: {
        alignItems: "center",
    },
    button: {
        height: 40,
        width: 80,
        padding: 4,
        borderRadius: 20,
    },
    label: {
        color: "#faf7f2",
        fontSize: 12,
        fontWeight: "900",
        marginTop: -4,
        marginBottom: 2,
    },
});

export default BottomNavBar;
