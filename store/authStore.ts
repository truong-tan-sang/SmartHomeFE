// store/authStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApiService, LoginAccountData } from '../services/AuthService'; // Import LoginAccountData
import apiClient from '../services/apiClient';

// (Tùy chọn) Định nghĩa kiểu cho thông tin người dùng muốn lưu trong store
interface UserData {
    id: string;
    fullName: string;
    email: string;
    phone: string | null;
}

interface AuthState {
    isLoggedIn: boolean;
    isLoading: boolean; // Dùng để chỉ trạng thái loading chung của store (ví dụ: checkAuthStatus)
    userToken: string | null;
    userData: UserData | null; // Thêm state để lưu thông tin người dùng
    checkAuthStatus: () => Promise<void>;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (data: { name: string, email: string, password: string }) => Promise<void>;
    // (Tùy chọn) Action để cập nhật userData nếu cần
    // setUserData: (data: UserData | null) => void;
}

const TOKEN_KEY = 'userToken';
const USER_DATA_KEY = 'userData'; // Key để lưu userData vào AsyncStorage

export const useAuthStore = create<AuthState>((set, get) => ({
    isLoggedIn: false,
    isLoading: true,
    userToken: null,
    userData: null,

    checkAuthStatus: async () => {
        console.log("[AuthStore] Checking auth status...");
        set({ isLoading: true });
        try {
            const token = await AsyncStorage.getItem(TOKEN_KEY);
            const storedUserData = await AsyncStorage.getItem(USER_DATA_KEY);

            if (token) {
                console.log("[AuthStore] Token found in AsyncStorage:", token);
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`; // Cập nhật header cho apiClient
                let currentUserData: UserData | null = null;
                if (storedUserData) {
                    try {
                        currentUserData = JSON.parse(storedUserData);
                        console.log("[AuthStore] UserData found in AsyncStorage:", currentUserData);
                    } catch (e) {
                        console.error("[AuthStore] Failed to parse stored userData, removing it.", e);
                        await AsyncStorage.removeItem(USER_DATA_KEY);
                    }
                }
                set({ isLoggedIn: true, userToken: token, userData: currentUserData, isLoading: false });

                // (Tùy chọn nâng cao) Gọi API /me hoặc tương tự để xác thực token và làm mới userData
                // Điều này hữu ích nếu thông tin user có thể thay đổi ở server
                // try {
                //     console.log("[AuthStore] Verifying token and fetching fresh user profile...");
                //     const freshProfile = await userService.getUserProfile(); // Giả sử bạn có userService.getUserProfile()
                //     const freshUserData = { id: freshProfile.id, fullName: freshProfile.name, email: freshProfile.email, phone: freshProfile.phone || null };
                //     await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(freshUserData));
                //     set({ userData: freshUserData });
                //     console.log("[AuthStore] User profile refreshed and saved.");
                // } catch (profileError) {
                //     console.warn("[AuthStore] Token might be invalid (profile fetch failed), logging out:", profileError);
                //     await get().logout(); // Logout nếu token không hợp lệ với server
                // }

            } else {
                console.log("[AuthStore] No token found in AsyncStorage.");
                set({ isLoggedIn: false, userToken: null, userData: null, isLoading: false });
            }
        } catch (error) {
            console.error("[AuthStore] Failed to check auth status from AsyncStorage:", error);
            set({ isLoggedIn: false, userToken: null, userData: null, isLoading: false });
        }
    },

    login: async (email, password) => {
        console.log(`[AuthStore] Attempting login for email: ${email}`);
        // Không cần set isLoading ở đây vì LoginScreen đã có state loading riêng
        try {
            const loginResponse: LoginAccountData = await authApiService.login(email, password);
            console.log("[AuthStore] Login service call successful, response:", loginResponse);

            if (loginResponse.token) {
                await AsyncStorage.setItem(TOKEN_KEY, loginResponse.token);
                // Cập nhật header Authorization cho các request tiếp theo của apiClient
                // Cách này tốt hơn là dựa vào interceptor request để lấy từ store mỗi lần,
                // vì nó đảm bảo header được set ngay sau khi login thành công.
                apiClient.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.token}`;

                const currentUserData: UserData = {
                    id: loginResponse.id,
                    fullName: loginResponse.fullName,
                    email: loginResponse.email,
                    phone: loginResponse.phone,
                };
                await AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(currentUserData));

                set({ isLoggedIn: true, userToken: loginResponse.token, userData: currentUserData });
                console.log("[AuthStore] User logged in successfully. Token and userData stored.");
            } else {
                // Trường hợp này không nên xảy ra nếu authApiService.login ném lỗi khi không có token
                console.error("[AuthStore] Token not found in login response, although service call was 'successful'.");
                throw new Error("Login failed: Token was not returned from the server.");
            }
        } catch (error) {
            console.error("[AuthStore] Login action failed:", error.message);
            // Xóa token (nếu có) để đảm bảo trạng thái sạch sẽ khi login thất bại
            await AsyncStorage.removeItem(TOKEN_KEY);
            await AsyncStorage.removeItem(USER_DATA_KEY);
            delete apiClient.defaults.headers.common['Authorization'];
            set({ isLoggedIn: false, userToken: null, userData: null }); // Reset state
            throw error; // Ném lỗi ra để LoginScreen có thể bắt và hiển thị
        }
    },

    register: async (data) => {
        console.log(`[AuthStore] Attempting registration for email: ${data.email}`);
        try {
            // !!! QUAN TRỌNG: Nếu API đăng ký là GraphQL, authApiService.register cần được cập nhật
            const response = await authApiService.register(data);
            if (response.success) {
                console.log("[AuthStore] Registration successful:", response.message);
                // (Tùy chọn) Tự động đăng nhập hoặc điều hướng đến Login
            } else {
                throw new Error(response.message || "Registration failed due to an unknown server issue.");
            }
        } catch (error) {
            console.error("[AuthStore] Register action failed:", error.message);
            throw error;
        }
    },

    logout: async () => {
        console.log("[AuthStore] Attempting logout...");
        try {
            await authApiService.logoutUser(); // Gọi API logout của backend (nếu có)
        } catch (error) {
            console.warn("[AuthStore] Server logout API call failed, proceeding with client-side logout:", error.message);
        } finally {
            await AsyncStorage.removeItem(TOKEN_KEY);
            await AsyncStorage.removeItem(USER_DATA_KEY); // Xóa cả userData
            delete apiClient.defaults.headers.common['Authorization']; // Xóa token khỏi default header của apiClient
            set({ isLoggedIn: false, userToken: null, userData: null, isLoading: false });
            console.log("[AuthStore] User logged out from client. Token and userData cleared.");
        }
    },

    // (Tùy chọn) Action để cập nhật userData
    // setUserData: (data: UserData | null) => {
    //     set({ userData: data });
    //     if (data) {
    //         AsyncStorage.setItem(USER_DATA_KEY, JSON.stringify(data)).catch(e => console.error("Failed to save userData to AsyncStorage", e));
    //     } else {
    //         AsyncStorage.removeItem(USER_DATA_KEY).catch(e => console.error("Failed to remove userData from AsyncStorage", e));
    //     }
    // }
}));

// --- Khởi tạo kiểm tra trạng thái xác thực ---
// Đảm bảo checkAuthStatus chỉ được gọi một lần khi ứng dụng khởi chạy
// và store được khởi tạo lần đầu.
let authStatusChecked = false;
const unsubscribe = useAuthStore.subscribe((state, prevState) => {
    // Chỉ chạy một lần khi isLoading chuyển từ true (initial) sang false
    if (prevState.isLoading && !state.isLoading && !authStatusChecked) {
        authStatusChecked = true;
        console.log("[AuthStore] Initial auth status check has completed.");
        unsubscribe(); // Hủy subscribe sau khi chạy xong để tránh gọi lại không cần thiết
    }
});

// Gọi hàm kiểm tra trạng thái một lần duy nhất khi store được import lần đầu
// (thường là khi ứng dụng bắt đầu)
if (!authStatusChecked && useAuthStore.getState().isLoading) { // Chỉ gọi nếu chưa check và đang ở trạng thái loading ban đầu
    useAuthStore.getState().checkAuthStatus().catch(e => {
        // Lỗi ở đây thường là lỗi nghiêm trọng với AsyncStorage, vẫn cần đánh dấu đã check
        console.error("[AuthStore] Critical error during initial auth status check:", e);
        authStatusChecked = true; // Đảm bảo không lặp lại vô hạn
    });
}
