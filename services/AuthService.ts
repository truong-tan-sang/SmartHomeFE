// services/AuthService.ts
import apiClient from './apiClient';

// --- Interfaces for GraphQL Login ---

// Input cho LoginAccount mutation
interface LoginAccountInput {
    email: string;
    password: string;
}

// Dữ liệu trả về bên trong LoginAccount (thông tin user và token)
export interface LoginAccountData { // Export để authStore có thể sử dụng
    id: string;
    fullName: string;
    email: string;
    phone: string | null; // Phone có thể là null
    token: string;
}

// Cấu trúc response đầy đủ từ GraphQL cho LoginAccount mutation
interface LoginGraphQLResponse {
    data?: { // data có thể không tồn tại nếu có lỗi ở tầng GraphQL
        LoginAccount: LoginAccountData;
    };
    errors?: Array<{ message: string; [key: string]: any }>; // Mảng lỗi GraphQL
}

// --- Interfaces for GraphQL Register (Giữ lại hoặc điều chỉnh nếu API đăng ký cũng là GraphQL) ---
interface RegisterData {
    name: string; // Hoặc fullName tùy theo API
    email: string;
    password: string;
}

interface RegisterResponse { // Điều chỉnh nếu API đăng ký trả về khác
    success: boolean;
    message?: string;
    // data?: any;
}

// --- Interfaces for GraphQL Delete Account (Giữ lại hoặc điều chỉnh) ---
interface DeleteAccountResponse {
    success: boolean;
    message?: string;
    // data?: any;
}


export const authApiService = {
    login: async (emailInput: string, passwordInput: string): Promise<LoginAccountData> => {
        const graphqlQuery = {
            query: `
                mutation LoginAccount($input: LoginAccount!) {
                    LoginAccount(account: $input) {
                        id
                        fullName
                        email
                        phone
                        token
                    }
                }
            `,
            variables: {
                input: {
                    email: emailInput,
                    password: passwordInput,
                }
            }
        };

        try {
            console.log('[AuthService] Attempting GraphQL login with variables:', graphqlQuery.variables);
            // GraphQL requests thường là POST đến một endpoint chung, ví dụ /query
            const response = await apiClient.post<LoginGraphQLResponse>('/query', graphqlQuery);
            console.log('[AuthService] GraphQL login response raw:', response);

            if (response.data?.errors && response.data.errors.length > 0) {
                // Nếu có lỗi từ GraphQL server (ví dụ: validation, sai query)
                console.error('[AuthService] GraphQL login errors:', response.data.errors);
                throw new Error(response.data.errors.map(err => err.message).join(', '));
            }

            if (response.data?.data?.LoginAccount) {
                console.log('[AuthService] GraphQL login successful, data:', response.data.data.LoginAccount);
                return response.data.data.LoginAccount;
            } else {
                // Trường hợp không có lỗi rõ ràng từ GraphQL nhưng không có data mong muốn
                console.error('[AuthService] GraphQL login response missing LoginAccount data:', response.data);
                throw new Error("Login failed: Unexpected response structure from server.");
            }
        } catch (error) {
            // Xử lý lỗi mạng hoặc lỗi từ interceptor của apiClient (ví dụ 401 đã được xử lý ở apiClient)
            console.error("[AuthService] Login API error (catch block):", error.message);
            // Ném lại lỗi để component hoặc store có thể bắt
            // Nếu lỗi đã là Error instance, ném lại nó, nếu không, tạo Error mới
            if (error instanceof Error) {
                throw error;
            }
            throw new Error("Login failed due to an unknown error.");
        }
    },

    // --- Các hàm khác giữ nguyên hoặc điều chỉnh tương tự nếu chúng cũng là GraphQL ---
    register: async (data: RegisterData): Promise<RegisterResponse> => {
        try {
            // !!! QUAN TRỌNG: Nếu API đăng ký cũng là GraphQL, cần thay đổi tương tự hàm login
            console.warn("[AuthService] Register function needs to be updated if using GraphQL for registration.");
            // Giả sử endpoint đăng ký vẫn là RESTful cho ví dụ này
            const response = await apiClient.post<RegisterResponse>('/auth/register', data);
            return response.data;
        } catch (error) {
            console.error("Register API error:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.message || "Registration failed";
            throw new Error(errorMessage);
        }
    },

    logoutUser: async (): Promise<void> => {
        try {
            // !!! QUAN TRỌNG: Nếu API logout là GraphQL mutation, cần thay đổi
            console.log("[AuthService] User logout API call (simulated or actual if endpoint exists)");
            // Ví dụ: await apiClient.post('/auth/logout'); // Nếu là REST
            // Hoặc gửi GraphQL mutation nếu có
        } catch (error) {
            console.error("Logout API error:", error.response?.data || error.message);
        }
    },

    deleteAccount: async (): Promise<DeleteAccountResponse> => {
        try {
            // !!! QUAN TRỌNG: Nếu API xóa tài khoản là GraphQL mutation, cần thay đổi
            console.warn("[AuthService] DeleteAccount function needs to be updated if using GraphQL.");
            // Giả sử endpoint vẫn là RESTful
            const response = await apiClient.delete<DeleteAccountResponse>('/user/delete');
            return response.data;
        } catch (error) {
            console.error("Delete account API error:", error.response?.data || error.message);
            const errorMessage = error.response?.data?.message || error.message || "Failed to delete account";
            throw new Error(errorMessage);
        }
    }
};
