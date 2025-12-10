import { cancelOrder, getOrders } from "@/api/ordersAPI";
import CustomLoader from "@/components/CustomLoader";
import OrderList from "@/components/OrderList/OrderList";
import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store"; // Import SecureStore
import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
];

const PAGE_SIZE = 5;

const MyOrderScreen = ({ navigation, route }) => {
  // Sửa state để có thể cập nhật user
  const [currentUser, setCurrentUser] = useState(route.params?.user || null);
  
  const processedTimestamp = useRef(0);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("PENDING");
  
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // ====================================================
  // 1. HÀM MỚI: LẤY USER AN TOÀN (Safe Get User)
  // ====================================================
  const ensureUser = async () => {
    // Nếu state đã có user, dùng luôn
    if (currentUser && currentUser.id) return currentUser;

    try {
      const value = await SecureStore.getItemAsync("authUser");
      if (value) {
        const userObj = JSON.parse(value);
        setCurrentUser(userObj); // Lưu lại vào state
        return userObj;
      }
    } catch (e) {
      console.log("Error getting user from store:", e);
    }
    
    // Nếu vẫn không có -> Về Login
    navigation.replace("login");
    return null;
  };

  // ====================================================
  // HÀM GỌI API (Sửa để nhận userObj thay vì dùng state trực tiếp)
  // ====================================================
  const fetchOrders = async (userObj, statusToFetch, pageNum = 0, isAppend = false) => {
    // Check kỹ ID
    const userId = userObj?.id || userObj?.user?.id;
    if (!userId) return;

    if (isAppend && (!hasMore || isLoadingMore)) return;

    try {
      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      console.log(`Fetching: ${statusToFetch} | Page: ${pageNum}`);

      const response = await getOrders({
        userId: userId,
        status: statusToFetch,
        page: pageNum,
        pageSize: PAGE_SIZE,
      });

      const newOrders = response.data.result || [];

      if (newOrders.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      if (isAppend) {
        setOrders((prev) => [...prev, ...newOrders]);
      } else {
        setOrders(newOrders);
      }
      
      setPage(pageNum);

    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setRefreshing(false);
    }
  };

  // ===============================================
  // LOGIC XỬ LÝ (SỬA ĐỂ DÙNG ensureUser)
  // ===============================================
  useEffect(() => {
    const initData = async () => {
      // Đảm bảo có user trước khi làm gì khác
      const userToUse = await ensureUser();
      if (!userToUse) return;

      const { action, timestamp } = route.params || {};

      if (action === "CANCEL_SUCCESS" && timestamp) {
        if (timestamp > processedTimestamp.current) {
          processedTimestamp.current = timestamp;

          setTimeout(() => {
            setSelectedStatus("CANCELLED");
            fetchOrders(userToUse, "CANCELLED", 0, false);
          }, 500); 
        }
      } else {
        // Load lần đầu tiên
        if (orders.length === 0 && !isLoading) {
          fetchOrders(userToUse, selectedStatus, 0, false);
        }
      }
    };

    initData();
  }, [route.params]); // Vẫn giữ dependency như cũ

  // ===============================================
  // HANDLERS (SỬA ĐỂ DÙNG ensureUser)
  // ===============================================

  const handleRefresh = async () => {
    setRefreshing(true);
    setHasMore(true);
    const userToUse = await ensureUser();
    fetchOrders(userToUse, selectedStatus, 0, false);
  };

  const handleChangeStatus = async (status) => {
    setSelectedStatus(status);
    setOrders([]); 
    setHasMore(true);
    const userToUse = await ensureUser();
    fetchOrders(userToUse, status, 0, false);
  };

  const handleLoadMore = async () => {
    if (hasMore && !isLoading && !isLoadingMore) {
      const nextPage = page + 1;
      const userToUse = await ensureUser();
      fetchOrders(userToUse, selectedStatus, nextPage, true);
    }
  };

  const confirmCancelOrder = (orderId) => {
    Alert.alert(
      "Confirm Cancellation",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, cancel",
          style: "destructive",
          onPress: () => handleCancelOrder(orderId),
        },
      ]
    );
  };

  const handleCancelOrder = async (orderId) => {
    try {
      setIsLoading(true);
      await cancelOrder(orderId);
      Alert.alert("Success", "Order has been cancelled.");
      handleRefresh();
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to cancel order");
      setIsLoading(false);
    }
  };

  const renderFooter = () => {
    if (!isLoadingMore) return <View style={{ height: 20 }} />;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  // Render màn hình trắng tạm thời nếu đang tìm user (tránh render UI lỗi)
  if (!currentUser) {
    return <View style={[styles.container, styles.center]}><ActivityIndicator size="large" color={colors.primary} /></View>; 
  }

  return (
    <View style={styles.container}>
      <CustomLoader visible={isLoading && page === 0} label="Loading..." />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle-outline" size={30} color={colors.muted} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>My Orders</Text>

      <View style={{ height: 60 }}>
        <FlatList
          horizontal
          data={ORDER_STATUSES}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ padding: 10 }}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.statusTab,
                selectedStatus === item && styles.activeStatusTab,
              ]}
              onPress={() => handleChangeStatus(item)}
            >
              <Text
                style={[
                  styles.statusTabText,
                  selectedStatus === item && styles.activeStatusTabText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item, index) => item.orderId.toString() + index}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        
        ListEmptyComponent={
          !isLoading && (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>No orders found in {selectedStatus}.</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <OrderList
            item={item}
            onPress={() =>
              navigation.navigate("myorderdetail", {
                orderDetail: item,
                user: currentUser, // Dùng currentUser từ state
              })
            }
            onCancel={() => confirmCancelOrder(item.orderId)}
          />
        )}
      />
    </View>
  );
};

export default MyOrderScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.light },
  center: { justifyContent: 'center', alignItems: 'center', flex: 1 },
  topBar: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    paddingHorizontal: 20,
    marginBottom: 4,
    color: colors.muted,
  },
  statusTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#EEE",
    marginHorizontal: 5,
    height: 36,
    justifyContent: "center",
  },
  activeStatusTab: {
    backgroundColor: colors.primary,
  },
  statusTabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "gray",
  },
  activeStatusTabText: {
    color: "white",
  },
  empty: {
    marginTop: 40,
    alignItems: "center",
  },
  emptyText: {
    fontStyle: "italic",
    fontSize: 16,
    color: colors.muted,
  },
});
