import axios from "@/utils/Axios";
import { getToken } from "@/utils/authService";

export interface GetProductsParams {
    page?: number;
    size?: number;
    categoryId?: number | null;
}

export const getProducts = async ({
    page = 0,
    size = 10,
    categoryId,
}: GetProductsParams) => {
    const accessToken = await getToken();

    if (!accessToken) {
        throw new Error("User not logged in");
    }

    const response = await axios.get("/api/v1/products/with-category", {
        params: {
            page,
            size,
            ...(categoryId !== null && categoryId !== undefined
                ? { categoryId }
                : {}),
        },
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return response.data;
};


export const getProductById = async (id: number) => {
    const accessToken = await getToken();

    if (!accessToken) {
        throw new Error("User not logged in");
    }

    // URL dựa trên giả định endpoint backend là /api/v1/products/{id}
    const response = await axios.get(`/api/v1/products/${id}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return response.data;
};