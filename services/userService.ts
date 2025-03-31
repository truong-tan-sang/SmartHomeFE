export const getUserProfile = async () => {
    // Gọi API để lấy thông tin user
    const response = await fetch('/api/user/profile');
    return response.json();
};


export const updateUserProfile = async (data: UpdateProfileData) => {
    // Gọi API để cập nhật thông tin
    const response = await fetch('/api/user/profile', {
        method: 'POST',
        body: JSON.stringify(data)
    });
    return response.json();
};
export type UpdateProfileData = {
    name: string;
    email: string;
    newPassword?: string; // Optional vì không phải lúc nào cũng đổi mật khẩu
    avatarUrl?: string;   // Optional nếu có chức năng đổi avatar
};