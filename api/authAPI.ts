import axios from "@/utils/Axios";

export interface LoginData {
    username: string;
    password: string;
}

export interface SignUpData {
    username: string;
    email: string;
    password: string;
    phoneNumber: string;
    address?: string;
}

export interface LoginResponse {
    data: {
        user: {
        id: string;
        email: string;
        name: string;
    };
    access_token: string;
    }
}

export const login = async (
    params: LoginData
): Promise<LoginResponse> => {
    const response = await axios.post<LoginResponse>("/auth/login", params);
    return response.data;
};