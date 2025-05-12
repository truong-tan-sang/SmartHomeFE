// src/store/authStore.ts
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
    isLoggedIn: boolean;
    isLoading: boolean; // Thêm trạng thái loading để kiểm tra token ban đầu
    userToken: string | null; // Lưu token (ví dụ)
    checkAuthStatus: () => Promise<void>; // Hàm kiểm tra trạng thái đăng nhập lúc khởi động
    login: (token: string) => Promise<void>;
    logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    isLoggedIn: false,
    isLoading: true, // Bắt đầu ở trạng thái loading
    userToken: null,

    // Kiểm tra token đã lưu khi khởi động ứng dụng
    checkAuthStatus: async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            if (token) {
                set({ isLoggedIn: true, userToken: token, isLoading: false });
                // Optional: Có thể thêm bước gọi API để xác thực token ở đây
            } else {
                set({ isLoggedIn: false, userToken: null, isLoading: false });
            }
        } catch (error) {
            console.error("Failed to check auth status:", error);
            set({ isLoggedIn: false, userToken: null, isLoading: false }); // Xử lý lỗi
        }
    },

    // Hàm xử lý khi đăng nhập thành công
    login: async (token: string) => {
        try {
            await AsyncStorage.setItem('userToken', token);
            set({ isLoggedIn: true, userToken: token });
            // Ở đây bạn có thể gọi API lấy thông tin user nếu cần
        } catch (error) {
            console.error("Failed to save token:", error);
        }
    },

    // Hàm xử lý khi đăng xuất
    logout: async () => {
        try {
            await AsyncStorage.removeItem('userToken');
            set({ isLoggedIn: false, userToken: null });
            // Ở đây bạn có thể gọi API để thông báo server về việc logout
        } catch (error) {
            console.error("Failed to remove token:", error);
        }
    },
}));

// Gọi hàm kiểm tra trạng thái ngay khi store được khởi tạo
useAuthStore.getState().checkAuthStatus(); 
