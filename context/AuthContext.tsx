// context/AuthContext.tsx
import React from 'react';
import { AuthService } from '../services/AuthService';

const AuthContext = React.createContext({
    logout: () => {},
    deleteAccount: async () => {},
    // ... các hàm khác
});

export const AuthProvider = ({ children }) => {
    const logout = () => {
        // Xóa token, clear async storage, v.v...
        AuthService.logout();
    };

    const deleteAccount = async () => {
        try {
            await AuthService.deleteAccount();
            // Xóa tất cả dữ liệu local
            await AsyncStorage.clear();
        } catch (error) {
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{ logout, deleteAccount }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => React.useContext(AuthContext);