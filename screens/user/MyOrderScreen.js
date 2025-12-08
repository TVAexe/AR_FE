import { cancelOrder, getOrders } from "@/api/ordersAPI";
import CustomLoader from "@/components/CustomLoader";
import OrderList from "@/components/OrderList/OrderList";
import { colors } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState, useRef } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator, // Thêm component hiển thị loading xoay vòng ở dưới đáy
} from "react-native";

const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "SHIPPING",
  "DELIVERED",
  "CANCELLED",
];

const PAGE_SIZE = 5; // Số lượng đơn hàng mỗi lần tải

const MyOrderScreen = ({ navigation, route }) => {
  const user = route.params?.user;
  
  // Ref chặn vòng lặp (giữ nguyên từ bản fix trước)
  const processedTimestamp = useRef(0);

  const [isLoading, setIsLoading] = useState(false); // Loading toàn màn hình (lần đầu)
  const [isLoadingMore, setIsLoadingMore] = useState(false); // Loading khi kéo xuống dưới
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("PENDING");
  
  // --- PAGINATION STATES ---
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  // ====================================================
  // HÀM GỌI API ĐA NĂNG (Hỗ trợ cả Load mới và Load thêm)
  // ====================================================
  const fetchOrders = async (statusToFetch, pageNum = 0, isAppend = false) => {
    if (!user || !user.id) return;

    // Nếu đang tải thêm mà hết dữ liệu hoặc đang tải dở thì dừng
    if (isAppend && (!hasMore || isLoadingMore)) return;

    try {
      // Set trạng thái loading phù hợp
      if (isAppend) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const response = await getOrders({
        userId: user.id,
        status: statusToFetch,
        page: pageNum,
        pageSize: PAGE_SIZE,
      });

      const newOrders = response.data.result || [];

      // Kiểm tra xem còn dữ liệu để tải tiếp không
      if (newOrders.length < PAGE_SIZE) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }

      // Cập nhật danh sách đơn hàng
      if (isAppend) {
        // Nếu là tải thêm: Nối danh sách cũ + mới
        setOrders((prev) => [...prev, ...newOrders]);
      } else {
        // Nếu là làm mới: Ghi đè danh sách mới
        setOrders(newOrders);
      }
      
      // Cập nhật trang hiện tại
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
  // LOGIC XỬ LÝ KHI NHẬN TÍN HIỆU TỪ MÀN HÌNH CHI TIẾT
  // ===============================================
  useEffect(() => {
    const { action, timestamp } = route.params || {};

    if (action === "CANCEL_SUCCESS" && timestamp) {
      if (timestamp > processedTimestamp.current) {
        processedTimestamp.current = timestamp;

        setTimeout(() => {
          setSelectedStatus("CANCELLED");
          // Khi chuyển tab do hủy đơn, reset về trang 0
          fetchOrders("CANCELLED", 0, false);
        }, 500); 
      }
    } else {
      // Load lần đầu tiên
      if (orders.length === 0 && !isLoading) {
        fetchOrders(selectedStatus, 0, false);
      }
    }
  }, [route.params]);

  // ===============================================
  // CÁC HÀM SỰ KIỆN NGƯỜI DÙNG
  // ===============================================

  // 1. Kéo xuống để làm mới (Pull to Refresh) -> Reset về trang 0
  const handleRefresh = () => {
    setRefreshing(true);
    setHasMore(true); // Reset trạng thái còn dữ liệu
    fetchOrders(selectedStatus, 0, false);
  };

  // 2. Chuyển Tab -> Reset về trang 0
  const handleChangeStatus = (status) => {
    setSelectedStatus(status);
    setOrders([]); // Xóa danh sách cũ để tránh nhấp nháy
    setHasMore(true);
    fetchOrders(status, 0, false);
  };

  // 3. Kéo xuống đáy để tải thêm (Load More) -> Tăng trang lên 1
  const handleLoadMore = () => {
    if (hasMore && !isLoading && !isLoadingMore) {
      const nextPage = page + 1;
      fetchOrders(selectedStatus, nextPage, true);
    }
  };

  // 4. Logic Hủy đơn tại chỗ
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
      // Sau khi hủy, load lại từ đầu danh sách hiện tại
      handleRefresh();
    } catch (err) {
      Alert.alert("Error", err.message || "Failed to cancel order");
      setIsLoading(false);
    }
  };

  // Footer Component: Hiển thị vòng xoay khi đang tải thêm
  const renderFooter = () => {
    if (!isLoadingMore) return <View style={{ height: 20 }} />;
    return (
      <View style={{ paddingVertical: 20 }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  if (!user) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>User information missing.</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 20}}>
            <Text style={{color: 'blue'}}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Chỉ hiện Loader toàn màn hình khi tải trang đầu tiên */}
      <CustomLoader visible={isLoading && page === 0} label="Loading..." />

      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle-outline" size={30} color={colors.muted} />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>My Orders</Text>

      {/* Tabs List */}
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

      {/* DANH SÁCH ĐƠN HÀNG */}
      <FlatList
        data={orders}
        keyExtractor={(item, index) => item.orderId.toString() + index} // Thêm index để tránh trùng key
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        
        // --- CẤU HÌNH LOAD MORE ---
        onEndReached={handleLoadMore} // Gọi hàm khi kéo xuống đáy
        onEndReachedThreshold={0.5} // Gọi khi còn cách đáy 50% chiều dài
        ListFooterComponent={renderFooter} // Hiển thị loader ở đáy
        
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
                user: user,
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
