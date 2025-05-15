// services/userService.ts
import apiClient from './apiClient';

// Interface cho dữ liệu profile người dùng (nhận từ API)
export interface UserProfile {
    id: string; // Hoặc number, tùy theo API của bạn
    name: string; // Hoặc fullName
    email: string;
    phone?: string | null;
    avatarUrl?: string | null;
    // Các trường khác nếu có
}

// Interface cho dữ liệu gửi lên khi cập nhật profile
// Chỉ bao gồm các trường người dùng có thể sửa
export interface UpdateUserProfileInput {
    id?: string; // ID của user, có thể không cần nếu backend lấy từ token
    name?: string;
    phone?: string;
    avatarUrl?: string;
    // Email thường không cho đổi hoặc có quy trình riêng
    // Mật khẩu cũng nên có quy trình riêng
}

// Interface cho dữ liệu gửi lên khi đổi mật khẩu
export interface ChangePasswordInput {
    currentPassword?: string; // Bắt buộc
    newPassword: string;     // Bắt buộc
}

// Interface cho phản hồi chung (ví dụ: khi đổi mật khẩu thành công)
interface GeneralSuccessResponse {
    success: boolean;
    message?: string;
}

export const userService = {
    getUserProfile: async (): Promise<UserProfile> => {
        const graphqlQuery = {
            query: `
                query GetUserProfile {
                    userProfile { # Tên query field có thể là 'me', 'currentUser', 'userProfile', v.v.
                        id
                        name # Hoặc fullName
                        email
                        phone
                        avatarUrl
                    }
                }
            `,
            // variables: {} // Nếu query cần ID hoặc các biến khác
        };
        try {
            console.log("[userService] Attempting to fetch user profile via GraphQL...");
            // Giả sử endpoint GraphQL là '/query'
            const response = await apiClient.post<{ data?: { userProfile: UserProfile }; errors?: any[] }>('/query', graphqlQuery);
            
            if (response.data?.errors) {
                throw new Error(response.data.errors.map(e => e.message).join(', '));
            }
            if (response.data?.data?.userProfile) {
                console.log("[userService] Fetched user profile successfully:", response.data.data.userProfile);
                return response.data.data.userProfile;
            } else {
                throw new Error("Failed to fetch user profile or no data returned.");
            }
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("[userService] Error fetching user profile:", message);
            throw new Error(message);
        }
    },

    updateUserProfile: async (input: UpdateUserProfileInput): Promise<UserProfile> => {
        // Giả sử bạn có một mutation tên là UpdateUserProfile
        // và input type là UpdateUserProfileInput!
        // Backend sẽ tự lấy user ID từ token để biết cập nhật cho ai,
        // hoặc bạn có thể cần truyền ID trong input nếu API yêu cầu.
        const mutation = {
            query: `
                mutation UpdateUserProfile($input: UpdateUserProfileInput!) {
                    updateUserProfile(input: $input) {
                        id
                        name # Hoặc fullName
                        email
                        phone
                        avatarUrl
                    }
                }
            `,
            variables: { input }
        };
        try {
            console.log("[userService] Updating user profile with variables:", JSON.stringify(mutation.variables, null, 2));
            const response = await apiClient.post<GraphQLMutationResponse<{ updateUserProfile: UserProfile }>>('/query', mutation);
            if (response.data?.errors) throw new Error(response.data.errors.map(e => `Path: ${e.path?.join('.')} - Message: ${e.message}`).join('; '));
            if (!response.data?.data?.updateUserProfile) throw new Error("Failed to update profile or no data returned.");
            console.log("[userService] User profile updated successfully:", response.data.data.updateUserProfile);
            return response.data.data.updateUserProfile;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("[userService] Error updating user profile:", message);
            throw new Error(message);
        }
    },

    changePassword: async (input: ChangePasswordInput): Promise<GeneralSuccessResponse> => {
        // Giả sử bạn có một mutation tên là ChangePassword
        // và input type là ChangePasswordInput!
        const mutation = {
            query: `
                mutation ChangePassword($input: ChangePasswordInput!) {
                    changePassword(input: $input) {
                        success
                        message
                    }
                }
            `,
            variables: { input }
        };
        try {
            console.log("[userService] Changing password..."); // Không log input chứa mật khẩu
            const response = await apiClient.post<GraphQLMutationResponse<{ changePassword: GeneralSuccessResponse }>>('/query', mutation);
            if (response.data?.errors) throw new Error(response.data.errors.map(e => `Path: ${e.path?.join('.')} - Message: ${e.message}`).join('; '));
            if (!response.data?.data?.changePassword) throw new Error("Failed to change password or no data returned.");
            console.log("[userService] Password changed successfully:", response.data.data.changePassword);
            return response.data.data.changePassword;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : String(error);
            console.error("[userService] Error changing password:", message);
            throw new Error(message);
        }
    },
};

// Generic GraphQL Mutation Response Type (nếu chưa có ở nơi khác)
interface GraphQLMutationResponse<T> {
    data?: T | null; 
    errors?: Array<{ message: string; path?: string[]; [key: string]: any }>; 
}
