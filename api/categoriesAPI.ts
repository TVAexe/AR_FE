import axios from "@/utils/Axios";
import { getToken } from "@/utils/authService";

export const getCategories = async () => {

    const token = await getToken();

    const response = await axios.get("/api/v1/categories", {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};
