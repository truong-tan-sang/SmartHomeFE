import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View, ScrollView, Animated } from "react-native";
import { Text, IconButton, FAB } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import * as Components from "../components";
import { useTheme } from 'react-native-paper';

type SmartHomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'SmartHome'>;

interface House {
    id: string;
    name: string;
    rooms: string[];
    expanded: boolean;
    animation: Animated.Value;
}

export default function SmartHomeScreen() {
    const navigation = useNavigation<SmartHomeScreenNavigationProp>();
    const theme = useTheme();
    const [houses, setHouses] = useState<House[]>([
        {
            id: "1",
            name: "Main House",
            rooms: ["Bedroom", "Kitchen", "Living Room"],
            expanded: true,
            animation: new Animated.Value(1)
        },
    ]);

    const toggleHouse = (houseId: string) => {
        setHouses(prevHouses => 
            prevHouses.map(house => {
                if (house.id === houseId) {
                    const targetValue = house.expanded ? 0 : 1;
                    
                    Animated.timing(house.animation, {
                        toValue: targetValue,
                        duration: 150,
                        useNativeDriver: false
                    }).start();

                    return { 
                        ...house, 
                        expanded: !house.expanded 
                    };
                }
                return house;
            })
        );
    };


    const addNewHouse = () => {
        const newHouse: House = {
            id: Date.now().toString(),
            name: `House ${houses.length + 1}`,
            rooms: [],
            expanded: true,
            animation: new Animated.Value(0)
        };
        setHouses(prev => [...prev, newHouse]);
    };

    const addNewRoom = (houseId: string) => {
        setHouses(prevHouses =>
            prevHouses.map(house => {
                if (house.id === houseId) {
                    const newRoom = `New Room ${house.rooms.length + 1}`;
                    return { ...house, rooms: [...house.rooms, newRoom] };
                }
                return house;
            })
        );
    };

    const handleRoomPress = (houseId: string, room: string) => {
        navigation.navigate("ElecControl", { houseId, roomName: room });
    };

    const renderHouse = (house: House) => {
        const heightInterpolation = house.animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 200] // Thay 200 bằng chiều cao thực tế của content
        });

        const rotateInterpolation = house.animation.interpolate({
            inputRange: [0, 1],
            outputRange: ['-90deg', '0deg']
        });

        return (
            <View
                key={house.id}
                style={[styles.houseContainer, { 
                    backgroundColor: theme.colors.surface,
                    borderWidth: 2,
                    borderColor: theme.colors.primary 
                }]}
            >
                <TouchableOpacity
                    style={styles.houseHeader}
                    onPress={() => toggleHouse(house.id)}
                >
                    <Animated.View style={{ transform: [{ rotate: rotateInterpolation }]}}>
                        <IconButton
                            icon="chevron-down"
                            size={24}
                            iconColor={theme.colors.onSurface}
                        />
                    </Animated.View>

                    <Text style={[styles.houseName, { color: theme.colors.onSurface }]}>
                        {house.name}
                    </Text>

                    <IconButton
                        icon="plus"
                        size={20}
                        iconColor={theme.colors.primary}
                        onPress={() => addNewRoom(house.id)}
                    />
                </TouchableOpacity>

                <Animated.View 
                    style={[
                        styles.roomList, 
                        { 
                            height: heightInterpolation,
                            opacity: house.animation,
                            overflow: 'hidden'
                        }
                    ]}
                >
                    {house.rooms.map((room, index) => (
                        <TouchableOpacity
                            key={`${house.id}-${index}`}
                            style={[styles.roomButton, { 
                                backgroundColor: theme.colors.background, 
                                borderTopColor: theme.colors.primary, 
                                borderTopWidth: 1 
                            }]}
                            onPress={() => handleRoomPress(house.id, room)}
                        >
                            <Text style={[styles.roomText, { color: theme.colors.onSurface }]}>
                                {room}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </Animated.View>
            </View>
        );
    };

    return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={[styles.title, { color: theme.colors.primary }]}>
                    Welcome Kat Grem!
                </Text>

                {houses.map(renderHouse)}
            </ScrollView>

            <FAB
                style={[styles.fab, { backgroundColor: theme.colors.secondary }]}
                icon="home-plus"
                onPress={addNewHouse}
                color={theme.colors.onSecondary}
            />

            <Components.BottomNavBar activeRoute="SmartHome" />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        padding: 20,
        paddingBottom: 80,
    },
    title: {
        marginTop: 60,
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 30,
        textAlign: "center",
    },
    houseContainer: {
        borderRadius: 12,
        marginBottom: 15,
        overflow: "hidden",
        // elevation: 2,
    },
    houseHeader: {
        flexDirection: "row",
        alignItems: "center",
        padding: 10,
    },
    houseName: {
        flex: 1,
        fontSize: 18,
        fontWeight: "600",
        marginLeft: 8,
    },
    roomList: {
        padding: 10,
    },
    roomButton: {
        padding: 16,
        borderRadius: 8,
        marginVertical: 4,
        marginHorizontal: 8,
    },
    roomText: {
        fontSize: 16,
    },
    fab: {
        position: "absolute",
        margin: 16,
        right: 0,
        bottom: 60,
        zIndex: 1,
    },
});