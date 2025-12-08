import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { colors } from "@/constants";

const OrderList = ({ item, onPress, onCancel }) => {
  const totalQuantity = item.items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = item.totalAmount;

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.headerRow}>
        <Text style={styles.orderId}>Order # {item.orderId}</Text>
        <Text style={[styles.status, item.status === "DELIVERED" ? styles.completed : null]}>
          {item.status}
        </Text>
      </View>

      {/* PRODUCT LIST */}
      <View style={styles.itemsContainer}>
        {item.items.map((product) => (
          <View key={product.productId} style={styles.itemRow}>
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.productImage}
              resizeMode="cover"
            />

            {/* LEFT — Thông tin */}
            <View style={styles.productInfo}>
              <Text style={styles.productName}>{product.productName}</Text>
              <Text style={styles.productType}>{product.productType}</Text>
              <Text style={styles.productQuantity}>x{product.quantity}</Text>
            </View>

            {/* RIGHT — Giá */}
            <View style={styles.priceContainer}>
              {product.oldPrice &&
                product.oldPrice !== product.priceAtPurchase && (
                  <Text style={styles.oldPrice}>{product.oldPrice}$</Text>
                )}

              <Text style={styles.currentPrice}>{product.priceAtPurchase}$</Text>
            </View>
          </View>
        ))}
      </View>

      {/* FOOTER */}
      <View style={styles.footerRow}>
        <Text style={styles.totalText}>
          Total ({totalQuantity} items): {totalAmount}$
        </Text>

        <View style={styles.footerButtons}>
          {/* CANCEL button only if PENDING */}
          {item.status === "PENDING" && (
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => onCancel(item.orderId)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          )}



          <TouchableOpacity style={styles.detailButton} onPress={onPress}>
            <Text style={styles.detailButtonText}>Detail</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
};

export default OrderList;

const styles = StyleSheet.create({
  container: {
    padding: 12,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginHorizontal: 8,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  orderId: {
    fontWeight: "600",
    fontSize: 16,
  },

  status: {
    fontWeight: "600",
    fontSize: 14,
    color: "orange",
  },

  completed: {
    color: "green",
  },

  itemsContainer: {
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 4,

    // >>> Thêm viền ngăn cách
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 4
    },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },

  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
    backgroundColor: "#f0f0f0",
  },

  productInfo: {
    flex: 1,
  },

  productName: {
    fontSize: 15,
    fontWeight: "semibold",
  },

  productType: {
    fontSize: 13,
    color: "#999",
  },

  productQuantity: {
    fontSize: 13,
    marginTop: 4,
    color: "#999",
  },

  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  oldPrice: {
    fontSize: 14,
    color: "#999",
    textDecorationLine: "line-through",
  },

  currentPrice: {
    fontSize: 16,
    fontWeight: "semibold",
  },

  footerRow: {
    marginTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  footerButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#ff4d4f",
    borderRadius: 5,
  },

cancelButtonText: {
  color: "#fff",
  fontWeight: "600",
},

  totalText: {
    fontWeight: "semibold",
    fontSize: 14,
  },

  detailButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: colors.primary,
    borderRadius: 5,
  },

  detailButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
