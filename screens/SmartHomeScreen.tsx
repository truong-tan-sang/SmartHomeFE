import React, { useState } from "react";
import { StyleSheet, TouchableOpacity, View, ScrollView, Animated } from "react-native";
import { Text, IconButton, FAB, Modal, TextInput, Button } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { AppStackParamList } from "../navigation/AppNavigator";
import * as Components from "../components";
import { useTheme } from 'react-native-paper';

type SmartHomeScreenNavigationProp = StackNavigationProp<AppStackParamList, 'SmartHome'>;

interface House {
    id: string;
    name: string;
    rooms: string[];
    expanded: boolean;
    animation: Animated.Value;
    color: string;
}

export default function SmartHomeScreen() {
    const navigation = useNavigation<SmartHomeScreenNavigationProp>();
    const theme = useTheme();
    const [houses, setHouses] = useState<House[]>([]);
    
    // State cho các modal
    const [editingHouse, setEditingHouse] = useState<House | null>(null);
    const [newHouseName, setNewHouseName] = useState("");
    const [editingRoom, setEditingRoom] = useState<{houseId: string; roomIndex: number} | null>(null);
    const [newRoomName, setNewRoomName] = useState("");
    const [selectedHouseForColor, setSelectedHouseForColor] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState("");

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
            animation: new Animated.Value(0),
            color: "#6200ee" // Màu mặc định
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

    // Modal chọn màu
    const ColorPickerModal = () => (
        <Modal visible={!!selectedHouseForColor} onDismiss={() => setSelectedHouseForColor(null)}>
            <View style={[styles.modalContainer, { backgroundColor: theme.colors.background }]}>
                <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Chọn màu nhà</Text>
                <View style={styles.colorGrid}>
                    {['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'].map((color) => (
                        <TouchableOpacity
                            key={color}
                            style={[
                                styles.colorButton,
                                { 
                                    backgroundColor: color,
                                    borderColor: houses.find(h => h.id === selectedHouseForColor)?.color === color 
                                        ? theme.colors.primary 
                                        : 'transparent'
                                }
                            ]}
                            onPress={() => {
                                setHouses(prev => prev.map(house => 
                                    house.id === selectedHouseForColor ? { ...house, color } : house
                                ));
                                setSelectedHouseForColor(null);
                            }}
                        />
                    ))}
                </View>
            </View>
        </Modal>
    );

    const renderHouse = (house: House) => {
        const heightInterpolation = house.animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0,87 * house.rooms.length]
        });

        const rotateInterpolation = house.animation.interpolate({
            inputRange: [0, 1],
            outputRange: ['-90deg', '0deg']
        });

        return (
            <View
                key={house.id}
                style={[
                    styles.houseContainer, 
                    { 
                        backgroundColor: theme.colors.surface,
                        borderColor: house.color 
                    }
                ]}
            >
                <View style={styles.houseHeader}>
                    <TouchableOpacity
                        style={styles.expandButton}
                        onPress={() => toggleHouse(house.id)}
                    >
                        <Animated.View style={{ transform: [{ rotate: rotateInterpolation }] }}>
                            <IconButton
                                icon="chevron-down"
                                size={24}
                                iconColor={theme.colors.onSurface}
                            />
                        </Animated.View>
                        <Text style={[styles.houseName, { color: theme.colors.onSurface }]}>
                            {house.name}
                        </Text>
                    </TouchableOpacity>

                    <View style={styles.houseActions}>
                        <IconButton
                            icon="pencil"
                            size={20}
                            onPress={() => {
                                setEditingHouse(house);
                                setNewHouseName(house.name);
                            }}
                        />
                        <IconButton
                            icon="palette"
                            size={20}
                            onPress={() => setSelectedHouseForColor(house.id)}
                        />
                        <IconButton
                            icon="plus"
                            size={20}
                            onPress={() => addNewRoom(house.id)}
                            iconColor={house.color}
                        />
                    </View>
                </View>

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
                            style={[
                                styles.roomButton, 
                                { 
                                    backgroundColor: theme.colors.background,
                                    borderTopColor: house.color 
                                }
                            ]}
                            onPress={() => handleRoomPress(house.id, room)}
                        >
                            <Text style={[styles.roomText, { color: theme.colors.onSurface }]}>
                                {room}
                            </Text>
                            <IconButton
                                icon="pencil"
                                size={18}
                                onPress={() => {
                                    setEditingRoom({ houseId: house.id, roomIndex: index });
                                    setNewRoomName(room);
                                }}
                            />
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

            {/* Modal đổi tên nhà */}
            <Modal visible={!!editingHouse} onDismiss={() => setEditingHouse(null)}>
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Đổi tên nhà</Text>
                    <TextInput
                        style={styles.input}
                        value={newHouseName}
                        onChangeText={setNewHouseName}
                        mode="outlined"
                    />
                    <Button
                        mode="contained"
                        onPress={() => {
                            setHouses(prev => prev.map(house => 
                                house.id === editingHouse?.id 
                                    ? { ...house, name: newHouseName } 
                                    : house
                            ));
                            setEditingHouse(null);
                        }}
                    >
                        Lưu thay đổi
                    </Button>
                </View>
            </Modal>

            {/* Modal đổi tên phòng */}
            <Modal visible={!!editingRoom} onDismiss={() => setEditingRoom(null)}>
                <View style={[styles.modalContainer, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[styles.modalTitle, { color: theme.colors.onSurface }]}>Đổi tên phòng</Text>
                    <TextInput
                        style={styles.input}
                        value={newRoomName}
                        onChangeText={setNewRoomName}
                        mode="outlined"
                    />
                    <Button
                        mode="contained"
                        onPress={() => {
                            setHouses(prev => prev.map(house => {
                                if (house.id === editingRoom?.houseId) {
                                    const newRooms = [...house.rooms];
                                    newRooms[editingRoom.roomIndex] = newRoomName;
                                    return { ...house, rooms: newRooms };
                                }
                                return house;
                            }));
                            setEditingRoom(null);
                        }}
                    >
                        Lưu thay đổi
                    </Button>
                </View>
            </Modal>

            <ColorPickerModal />

            <FAB
                style={[styles.fab, { backgroundColor: theme.colors.secondary }]}
                icon="home-plus"
                onPress={addNewHouse}
                color={theme.colors.onSecondary}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        // paddingBottom: 80,
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
        borderWidth: 2,
    },
    houseHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 10,
    },
    expandButton: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
    },
    houseActions: {
        flexDirection: "row",
        alignItems: "center",
    },
    houseName: {
        fontSize: 18,
        fontWeight: "600",
        marginLeft: 8,
        flex: 1,
    },
    roomList: {
        // padding: 10,
    },
    roomButton: {
        padding: 16,
        borderRadius: 8,
        marginVertical: 4,
        marginHorizontal: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderTopWidth: 1,
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
    modalContainer: {
        padding: 20,
        margin: 20,
        borderRadius: 8,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "bold",
        marginBottom: 15,
    },
    input: {
        marginBottom: 15,
    },
    colorGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
    },
    colorButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        margin: 5,
        borderWidth: 2,
    },
});