import React from "react";
import { View, StyleSheet } from "react-native";
import { IconButton, Text } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/RootNavigator";

const NAV_ITEMS = [
    { route: "SmartHome", icon: "home", label: "Trang chủ" },
    { route: "ElecControl", icon: "lightning-bolt", label: "Điều khiển" },
    { route: "Schedule", icon: "calendar-clock", label: "Đặt lịch" },
    { route: "Profile", icon: "account", label: "Hồ sơ" }
];

type NavBarProps = {
    activeRoute?: string;
};

type NavItemProps = {
    route: string;
    icon: string;
    label: string;
    activeRoute?: string;
};

const NavItem = ({ route, icon, label, activeRoute }: NavItemProps) => {
    const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
    const isActive = activeRoute === route;
    return (
        <View style={styles.navItem}>
            <IconButton
                style={styles.button}
                // Mở rộng vùng nhấn bằng hitSlop
                hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                icon={isActive ? icon : `${icon}-outline`}
                mode={isActive ? "contained" : undefined}
                size={32}
                containerColor={isActive ? "#dac297" : "transparent"}
                iconColor="#faf7f2"
                onPress={() => navigation.navigate(route as any)}
            />
            <Text style={styles.label}>{label}</Text>
        </View>
    );
};

const BottomNavBar = ({ activeRoute }: NavBarProps) => {
    return (
        <View style={styles.container}>
            {NAV_ITEMS.map((item) => (
                <NavItem key={item.route} {...item} activeRoute={activeRoute} />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: "row",
        // Chia đều 4 mục theo chiều ngang
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#caa26a",
        paddingVertical: 8,
        position: "absolute",
        bottom: 0,
        width: "100%",
    },
    navItem: {
        flex: 1, // Mỗi mục chiếm 1/4 của thanh nav
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
