import axios from "@/utils/Axios";

export interface LoginData {
    email: string;
    password: string;
}

export interface SignUpData {
    username: string;
    email: string;
    password: string;
    phoneNumber: string; // 📌 Thêm phoneNumber
}

export interface LoginResponse {
    data: {
        user: {
            id: string;
            email: string;
            name: string;
            phoneNumber?: string; // 📌 Thêm phoneNumber vào response
        };
        access_token: string;
    }
}

export interface SignUpResponse {
    success: boolean;
    message: string;
    data?: {
        id: string;
        email: string;
        username: string;
        phoneNumber?: string; // 📌 Thêm phoneNumber
    };
}

export const login = async (
    params: LoginData
): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>("/auth/login", params);
    return response.data;
};

export const register = async (
    params: SignUpData
): Promise<SignUpResponse> => {
    const response = await axios.post<SignUpResponse>("/auth/register", params);
    return response.data;
};