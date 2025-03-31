// services/AuthService.ts
export const AuthService = {
    logout: () => {
        // Xử lý logic đăng xuất
    },
    
    deleteAccount: async () => {
        try {
            const response = await fetch('/api/account/delete', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.json();
        } catch (error) {
            throw error;
        }
    }
};