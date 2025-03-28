import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, TextInput, Button, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import * as Components from "../components";


type SignupScreenNavigationProp = StackNavigationProp<RootStackParamList, "Signup">;

export default function SignUpScreen() {
    const navigation = useNavigation<SignupScreenNavigationProp>();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    function handleRegister() {
        console.log("Thông tin đăng ký: ", name, email, password);
        navigation.navigate("SmartHome");
    }

    return (
        <View style={styles.container}>
            {/* Nút quay lại */}
            <Components.BackButton />

            <Text variant="headlineMedium" style={styles.title}>Đăng ký</Text>

            <TextInput label="Họ và tên" mode="outlined" value={name} onChangeText={setName} style={styles.input} />
            <TextInput label="Email" mode="outlined" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
            <TextInput label="Mật khẩu" mode="outlined" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />

            <Button mode="contained" onPress={handleRegister} style={styles.button}>Đăng ký</Button>

            <View style={styles.row}>
                <Text>Bạn đã có tài khoản? </Text>
                <Button mode="text" onPress={() => navigation.navigate("Login")}>Đăng nhập</Button>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        paddingHorizontal: 20,
        backgroundColor: "#F5F5F5",
    },
    title: {
        textAlign: "center",
        fontSize: 32, // Phóng to tiêu đề
        fontWeight: "bold", // Tăng độ đậm
        color: "#caa26a", // Đổi màu tiêu đề cho hợp theme
        marginBottom: 25,
    },
    input: {
        marginBottom: 15,
    },
    button: {
        marginTop: 10,
    },    
    buttonText: {
        fontSize: 18, // Tăng kích thước chữ nút
        fontWeight: "bold", // Chữ đậm hơn
    },
    row: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 15,
    },
});
