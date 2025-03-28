import React, { useState } from "react";
import { StyleSheet, View } from "react-native";
import { Text, TextInput, Button, IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import type { RootStackParamList } from "../navigation/RootNavigator";
import * as Components from "../components";

type LoginScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Login'>

export default function LoginScreen() {
    const navigation = useNavigation<LoginScreenNavigationProp>();

    const [email, setEmail] = useState("");      // State cho email
    const [password, setPassword] = useState(""); // State cho mật khẩu
    function handleLogin() {
        console.log("Thông tin đăng ký: ", email, password);
        navigation.navigate("SmartHome");
    }
    return (
        <View style={styles.container}>
            {/* Nút quay lại */}

            <Components.BackButton />

            <TextInput label="Email" mode="outlined" keyboardType="email-address" value={email} onChangeText={setEmail} style={styles.input} />
            <TextInput label="Mật khẩu" mode="outlined" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />

            {/* Nút đăng nhập */}
            <Button mode="contained" onPress={handleLogin}>
                Đăng nhập
            </Button>

            {/* Nút quay lại */}
            <View style={styles.row}>
                <Text style={styles.downText}>Chưa có tài khoản?</Text>
                <Button onPress={() => { navigation.navigate('Signup') }}>Đăng ký</Button>
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
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 20,
    },
    // input: {
    //     width: "100%",
    //     height: 50,
    //     borderColor: "#ccc",
    //     borderWidth: 1,
    //     borderRadius: 8,
    //     paddingHorizontal: 15,
    //     marginBottom: 15,
    //     backgroundColor: "#fff",
    // },
    input: {
        marginBottom: 15,
    },
    button: {
        width: "100%",
        backgroundColor: "#3498db",
        padding: 15,
        borderRadius: 8,
        alignItems: "center",
    },
    buttonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    row: {
        marginTop: 15,
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "center",
        fontSize: 16,
    },
    backText: {
        color: "#3498db",
        fontSize: 16,
    },
    downText: {
    },
});
