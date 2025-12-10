import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../constants";

const ProductCard = ({
  name,
  price,
  oldPrice, // 1. Nhận thêm prop giá cũ
  image,
  quantity,
  onPress,
  onPressSecondary,
  cardSize,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, { width: cardSize === "large" ? "100%" : 150 }]}
      onPress={onPress}
    >
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.productImage} />
      </View>
      <View style={styles.infoContainer}>
        <View>
          <Text style={styles.secondaryTextSm}>{`${name.substring(
            0,
            10
          )}`}</Text>
          
          {/* 2. Sửa phần hiển thị giá */}
          <View style={styles.priceContainer}>
            {/* Chỉ hiện giá cũ nếu nó lớn hơn giá hiện tại */}
            <Text style={styles.primaryTextSm}>{price}$</Text>
            {oldPrice > price && (
              <Text style={styles.oldPriceText}>{oldPrice}$</Text>
            )}
          </View>

        </View>
        <View>
          {quantity > 0 ? (
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={onPressSecondary}
            >
              <Ionicons name="cart" size={20} color="white" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.iconContainerDisable} disabled>
              <Ionicons name="cart" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default ProductCard;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    width: 150,
    height: 200,
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 5,
    elevation: 5,
  },
  imageContainer: {
    backgroundColor: colors.light,
    width: "100%",
    height: 140,
    borderRadius: 10,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    alignItems: "center",
    padding: 5,
    paddingBottom: 0,
  },
  productImage: {
    height: 120,
    width: 120,
  },
  infoContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 5,
  },
  secondaryTextSm: {
    fontSize: 16,
    fontWeight: "bold",
    textTransform: "capitalize",
  },
  primaryTextSm: {
    fontSize: 15,
    fontWeight: "bold",
    color: colors.primary,
  },
  // 3. Thêm Style cho giá cũ và container giá
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  oldPriceText: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.muted,
    textDecorationLine: 'line-through', // Gạch ngang chữ
    marginLeft: 5, // Khoảng cách với giá mới
  },
  iconContainer: {
    backgroundColor: colors.primary,
    width: 30,
    height: 30,
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainerDisable: {
    backgroundColor: colors.muted,
    width: 30,
    height: 30,
    borderRadius: 5,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
});
