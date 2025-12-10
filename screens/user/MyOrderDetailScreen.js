import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { cancelOrder as apiCancelOrder } from "@/api/ordersAPI";
import BasicProductList from "../../components/BasicProductList/BasicProductList";
import CustomLoader from "../../components/CustomLoader";
import { colors } from "../../constants";

const MyOrderDetailScreen = ({ navigation, route }) => {
  const { orderDetail, user } = route.params;
  
  const totalItems = orderDetail?.items?.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const [isLoading, setIsLoading] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  const dateFormat = (dateString) => {
    if (!dateString) return "-";
    const t = new Date(dateString);
    return `${t.getDate().toString().padStart(2, "0")}-${(t.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${t.getFullYear()} ${t
        .getHours()
        .toString()
        .padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    setTotalCost(
      orderDetail?.items?.reduce(
        (sum, item) =>
          sum + (item.priceAtPurchase ?? 0) * (item.quantity ?? 0),
        0
      )
    );
  }, [orderDetail]);

  const confirmCancel = () => {
    Alert.alert(
      "Cancel order",
      "Are you sure you want to cancel this order?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes, cancel", style: "destructive", onPress: handleCancel },
      ],
      { cancelable: true }
    );
  };

  const handleCancel = async () => {
    if (!orderDetail?.orderId) return;

    try {
      setIsLoading(true);
      await apiCancelOrder(orderDetail.orderId);
      setIsLoading(false);

      Alert.alert("Success", "Order cancelled", [
        {
          text: "OK",
          onPress: () => {
            navigation.navigate("myorder", {
              user: user,
              action: "CANCEL_SUCCESS",
              timestamp: Date.now(),
              merge: true,
            });
          },
        },
      ]);
    } catch (err) {
      setIsLoading(false);
      Alert.alert("Error", err?.message ?? "Failed to cancel order");
    }
  };

  const isPending = orderDetail?.status === "PENDING";

  return (
    <View style={styles.container}>
      <CustomLoader visible={isLoading} label={"Processing..."} />
      <StatusBar />
      <View style={styles.TopBarContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle-outline" size={30} color={colors.muted} />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <Text style={styles.screenNameText}>Order Details</Text>
        <Text style={styles.screenNameParagraph}>View all information about this order</Text>
      </View>

      <ScrollView style={styles.bodyContainer}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shipping Address</Text>
          <Text style={styles.cardContent}>{orderDetail?.shippingAddress}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Information</Text>
          {orderDetail?.orderId && (
            <Text style={styles.cardItem}>
              <Text style={styles.label}>Order ID: </Text>{orderDetail.orderId}
            </Text>
          )}
          {/* Hiển thị số điện thoại lấy từ user */}
          {user?.user?.phoneNumber && (
            <Text style={styles.cardItem}>
              <Text style={styles.label}>Phone number: </Text>{user.user.phoneNumber}
            </Text>
          )}
          {orderDetail?.createdAt && (
            <Text style={styles.cardItem}>
              <Text style={styles.label}>Created at: </Text>{dateFormat(orderDetail.createdAt)}
            </Text>
          )}

          {orderDetail?.updatedAt && (
            <Text style={styles.cardItem}>
              <Text style={styles.label}>Cancelled at: </Text>{dateFormat(orderDetail.updatedAt)}
            </Text>
          )}

          {orderDetail?.createdBy && (
            <Text style={styles.cardItem}>
              <Text style={styles.label}>Created by: </Text>{orderDetail.createdBy}
            </Text>
          )}

          {orderDetail?.updatedBy && (
            <Text style={styles.cardItem}>
              <Text style={styles.label}>Cancelled by: </Text>{orderDetail.updatedBy}
            </Text>
          )}
        </View>

        <View style={styles.card}>
          <View style={styles.packageHeader}>
            <Text style={styles.cardTitle}>PACKAGE DETAILS</Text>
            <Text style={styles.statusText}>{orderDetail?.status?.toUpperCase()}</Text>
          </View>
          <View style={styles.productList}>
            {orderDetail?.items?.map((product, index) => (
              <BasicProductList
                key={index}
                title={product.productName}
                price={product.priceAtPurchase}
                oldPrice={product.oldPrice}
                quantity={product.quantity}
                image={product.imageUrl}
                category={product.productType}
              />
            ))}
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.label}>Total ({totalItems} items):</Text>
            <Text style={styles.totalValue}> {totalCost}$</Text>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* CHỈ HIỆN FOOTER NẾU LÀ ĐƠN PENDING */}
      {isPending && (
        <View style={styles.footerBar}>
          {/* Nút Cancel giờ sẽ full width vì không còn nút Buy Again bên cạnh */}
          <TouchableOpacity 
            style={[styles.footerBtnFull, { backgroundColor: "#ff4d4f" }]} 
            onPress={confirmCancel}
          >
            <Text style={styles.cancelBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default MyOrderDetailScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    flex: 1,
    margin: 8,
  },
  TopBarContainer: {
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 5,
    paddingTop: 25,
  },
  screenNameContainer: {
    paddingHorizontal: 8,
    paddingBottom: 10,
  },
  screenNameText: {
    fontSize: 30,
    fontWeight: "700",
    color: colors.muted,
  },
  screenNameParagraph: {
    fontSize: 15,
    color: "#666",
  },
  bodyContainer: {
    flex: 1,
    width: "100%",
  },
  card: {
    backgroundColor: colors.white,
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    marginTop: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.muted,
  },
  cardContent: {
    paddingHorizontal: 10,
    marginVertical: 3,
    color: colors.muted,
  },
  cardItem: {
    paddingHorizontal: 10,
    marginVertical: 3,
    color: colors.muted,
  },
  packageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusText: {
    color: "red",
    fontWeight: "700",
  },
  label: {
    fontWeight: "600",
    color: colors.dark,
  },
  productList: {
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  totalValue: {
    fontWeight: "700",
    color: colors.primary,
  },
  footerBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    padding: 10,
    backgroundColor: colors.white,
    borderTopWidth: 0.5,
    borderColor: "#ccc",
  },
  footerBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  footerBtnFull: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  cancelBtn: {
    backgroundColor: "#ff4d4f",
    marginRight: 8,
  },
  cancelBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  buyBtn: {
    backgroundColor: colors.primary,
  },
  buyBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
});