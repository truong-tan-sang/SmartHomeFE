// services/userService.ts
import apiClient from './apiClient';

// Giả sử API trả về dữ liệu người dùng có dạng này
export interface UserProfile { // Export để có thể dùng ở nơi khác
    id: string; // Hoặc number, tùy API
    name: string;
    email: string;
    avatarUrl?: string;
    // Các trường khác mà API trả về...
    // Ví dụ: role, createdAt, etc.
}

export interface UpdateProfileData {
    name?: string;
    email?: string; // Cân nhắc việc cho phép đổi email và các vấn đề bảo mật liên quan
    avatarUrl?: string;
    // Không nên bao gồm newPassword ở đây, nên có API riêng cho đổi mật khẩu
}

export interface ChangePasswordData {
    currentPassword?: string; // Mật khẩu hiện tại, thường là bắt buộc
    newPassword: string;
}

// Kiểu dữ liệu trả về chung cho các thao tác thành công (nếu API không trả về dữ liệu cụ thể)
interface SuccessResponse {
    success: boolean;
    message?: string;
}

export const userService = {
    getUserProfile: async (): Promise<UserProfile> => {
        try {
            // !!! QUAN TRỌNG: Đảm bảo endpoint '/user/profile' (hoặc '/me') là chính xác
            const response = await apiClient.get<UserProfile>('/user/profile');
            // Nếu API của bạn gói dữ liệu trong một object con (ví dụ: response.data.data)
            // thì bạn cần điều chỉnh ở đây: return response.data.data;
            return response.data;
        } catch (error) {
            console.error("Get user profile API error:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.message || "Failed to fetch user profile";
            throw new Error(errorMessage);
        }
    },

    updateUserProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
        try {
            // !!! QUAN TRỌNG: Đảm bảo endpoint '/user/profile' (PUT hoặc POST) là chính xác
            const response = await apiClient.put<UserProfile>('/user/profile', data);
            return response.data; // Giả sử API trả về thông tin user đã cập nhật
        } catch (error) {
            console.error("Update user profile API error:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.message || "Failed to update user profile";
            throw new Error(errorMessage);
        }
    },

    changePassword: async (data: ChangePasswordData): Promise<SuccessResponse> => {
        try {
            // !!! QUAN TRỌNG: Đảm bảo endpoint '/user/change-password' là chính xác
            const response = await apiClient.post<SuccessResponse>('/user/change-password', data);
            return response.data;
        } catch (error) {
            console.error("Change password API error:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.message || "Failed to change password";
            throw new Error(errorMessage);
        }
    }
};
