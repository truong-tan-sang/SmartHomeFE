// services/apiClient.ts
import axios from 'axios';
import { useAuthStore } from '../store/authStore'; // Import Zustand store của bạn

const apiClient = axios.create({
    baseURL: 'https://dabe.thaily.id.vn', // <<< ĐÃ CẬP NHẬT BASE URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để đính kèm token vào mỗi request
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().userToken; // Lấy token từ Zustand
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// (Tùy chọn) Interceptor để xử lý lỗi response chung
apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        // Kiểm tra nếu lỗi là 401 và không phải là request thử lại
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true; // Đánh dấu là đã thử lại
            console.warn('Token expired or invalid.');

            // Xử lý refresh token (nếu API của bạn hỗ trợ)
            // try {
            //     console.log('Attempting to refresh token...');
            //     // Giả sử bạn có một endpoint và service để refresh token
            //     // const refreshResponse = await authApiService.refreshTokenFunction(useAuthStore.getState().refreshToken);
            //     // const newAccessToken = refreshResponse.data.accessToken;
            //     // useAuthStore.getState().setToken(newAccessToken); // Cập nhật token mới vào store
            //     // apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
            //     // originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            //     // return apiClient(originalRequest); // Thực hiện lại request ban đầu với token mới
            // } catch (refreshError) {
            //     console.error('Unable to refresh token, logging out.', refreshError);
            //     useAuthStore.getState().logout(); // Logout nếu refresh token thất bại
            //     // TODO: Điều hướng người dùng về màn hình Login, có thể thông qua một sự kiện hoặc callback
            //     return Promise.reject(refreshError);
            // }

            // Nếu không có cơ chế refresh token hoặc refresh thất bại:
            console.log('Logging out user due to 401 error.');
            useAuthStore.getState().logout(); // Logout người dùng
            // TODO: Cân nhắc điều hướng người dùng về màn hình Login ở đây
            // Ví dụ: RootNavigation.navigate('Auth'); (nếu bạn có global navigation)
        }
        return Promise.reject(error);
    }
);

export default apiClient;
