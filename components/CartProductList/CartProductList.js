import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../constants";

import { MaterialCommunityIcons } from "@expo/vector-icons";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Swipeable from "react-native-gesture-handler/Swipeable";

const CartProductList = ({
  image,
  title,
  price,
  oldPrice,
  quantity = 1,
  handleDelete,
  onPressDecrement,
  onPressIncrement,
  isChecked = false,
  onToggleCheck,
}) => {
  const rightSwipe = () => {
    return (
      <View style={styles.deleteButtonContainer}>
        <TouchableOpacity onPress={handleDelete}>
          <MaterialCommunityIcons
            name="delete"
            size={25}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <GestureHandlerRootView>
      <View style={styles.containerOuter}>
        <Swipeable renderRightActions={rightSwipe}>
          <View style={styles.container}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={onToggleCheck}
            >
              <MaterialCommunityIcons
                name={isChecked ? "checkbox-marked" : "checkbox-blank-outline"}
                size={22}
                color={isChecked ? colors.primary : colors.muted}
              />
            </TouchableOpacity>
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.productImage} />
            </View>
            <View style={styles.productInfoContainer}>
              <Text style={styles.productTitle} numberOfLines={1}>
                {title}
              </Text>
              
              <View style={styles.productListBottomContainer}>
                
                {/* --- SỬA TẠI ĐÂY: Hiển thị giá trên cùng 1 hàng --- */}
                <View style={styles.priceContainer}>
                  {oldPrice > price && (
                    <Text style={styles.productOldPrice}>
                      {(oldPrice * quantity).toFixed(2)}$
                    </Text>
                  )}
                  <Text style={styles.productPrice}>
                    {(price * quantity).toFixed(2)}$
                  </Text>
                </View>
                {/* ------------------------------------------------ */}

                <View style={styles.counter}>
                  <TouchableOpacity
                    style={styles.counterButtonContainer}
                    onPress={onPressDecrement}
                  >
                    <Text style={styles.counterButtonText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.counterCountText}>{quantity}</Text>
                  <TouchableOpacity
                    style={styles.counterButtonContainer}
                    onPress={onPressIncrement}
                  >
                    <Text style={styles.counterButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Swipeable>
      </View>
    </GestureHandlerRootView>
  );
};

export default CartProductList;

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: colors.white,
    height: 120,
    borderRadius: 15,
    width: "100%",
    padding: 10,
    marginBottom: 10,
    elevation: 2,
  },
  containerOuter: {
    backgroundColor: colors.primary_light,
    height: 120,
    borderRadius: 15,
    width: "100%",
    marginBottom: 10,
  },
  productImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
  },
  imageContainer: {
    backgroundColor: colors.light,
    borderRadius: 10,
  },
  productInfoContainer: {
    paddingVertical: 10,
    paddingHorizontal: 5,
    height: "100%",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-around",
    alignItems: "flex-start",
  },
  productTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.dark,
  },
  
  // --- STYLE MỚI CHO GIÁ ---
  priceContainer: {
    flexDirection: 'row', // Xếp ngang
    alignItems: 'center', // Căn giữa theo chiều dọc
  },
  productOldPrice: {
    fontSize: 12,
    fontWeight: "bold",
    color: colors.muted,
    textDecorationLine: "line-through",
    marginRight: 8, // Khoảng cách với giá mới
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.primary,
  },
  // -------------------------

  deleteButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary_light,
    borderTopEndRadius: 15,
    borderBottomRightRadius: 15,
    marginBottom: 10,
    width: 70,
  },
  productListBottomContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 5,
  },
  counter: {
    backgroundColor: colors.white,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  counterButtonContainer: {
    display: "flex",
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.muted,
    borderRadius: 12,
    elevation: 2,
  },
  counterButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.white,
  },
  counterCountText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxContainer: {
    paddingHorizontal: 5,
    justifyContent: "center",
    alignItems: "center",
  },
});