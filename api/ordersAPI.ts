import axios from "@/utils/Axios";
import { getToken } from "@/utils/authService";

// ----------- TYPES ------------------
export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "SHIPPED"
    | "SHIPPING"
    | "DELIVERED"
    | "CANCELLED";

export interface OrderItem {
    productId: number;
    productName: string;
    productType: string;
    quantity: number;
    priceAtPurchase: number;
    imageUrl: string;
}

export interface Order {
    orderId: number;
    shippingAddress: string;
    totalAmount: number;
    status: OrderStatus;
    items: OrderItem[];
}

export interface PaginationMeta {
    page: number;
    pageSize: number;
    pages: number;
    total: number;
}

export interface OrderListResponse {
    meta: PaginationMeta;
    result: Order[];
}

export interface ApiResponse<T> {
    statusCode: number;
    error: string | null;
    message: string;
    data: T;
}

export interface GetOrdersParams {
    userId: number;
    status?: OrderStatus;
    page?: number;
    pageSize?: number;
}

// ----------- API CALL ------------------
export const getOrders = async ({
    userId,
    status = "PENDING", // mặc định load PENDING
    page = 0,
    pageSize = 5,
}: GetOrdersParams): Promise<ApiResponse<OrderListResponse>> => {

    const token = await getToken();

    if (!token) {
        throw new Error("User not logged in");
    }

    const response = await axios.get("/api/v1/orders/paging", {
        params: {
            status,  // 'PENDING', 'CONFIRMED', ...
            page,    // số trang
            size: pageSize, // chú ý BE dùng 'size'
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    return response.data;
};

// ordersAPI.ts
export const cancelOrder = async (orderId: number) => {
  const token = await getToken();
  if (!token) throw new Error("User not logged in");

  const response = await axios.put(`/api/v1/orders/${orderId}/cancel`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};
