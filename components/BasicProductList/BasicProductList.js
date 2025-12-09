import React from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { colors } from "../../constants";

const BasicProductList = ({ title, price, oldPrice, quantity, image, category }) => {
  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        {/* PRODUCT IMAGE */}
        <Image source={{ uri: image }} style={styles.productImage} />

        {/* PRODUCT INFO */}
        <View style={styles.productInfoContainer}>
          <Text style={styles.secondaryText}>{title}</Text>
          <Text style={styles.categoryText}>{category}</Text>
          <Text style={styles.quantityText}>x{quantity}</Text>
        </View>
      </View>

      {/* TOTAL PRICE */}
      <View style={styles.priceRow}>
        {oldPrice !== price && (
          <Text style={styles.oldPrice}>{oldPrice}$</Text>
        )}
        <Text style={styles.newPrice}>{price}$</Text>
      </View>


    </View>
  );
};

export default BasicProductList;

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: colors.white,
    height: 90,
    borderBottomWidth: 1,
    borderBottomColor: colors.light,
    paddingHorizontal: 8,
    paddingVertical: 0,
  },

  innerContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  productImage: {
    width: 70,     // to hơn
    height: 70,
    borderRadius: 8,
    backgroundColor: colors.light,
  },

  productInfoContainer: {
    marginLeft: 10,
    justifyContent: "center",
  },

  secondaryText: {
    fontSize: 15,
    fontWeight: "semibold",
  },

  categoryText: {
    fontSize: 13,
    color: colors.muted,
    marginTop: 1,
  },

  quantityText: {
    fontSize: 13,
    marginTop: 2,
    color: colors.muted,
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6, // tạo khoảng cách giữa hai giá
  },

  oldPrice: {
    fontSize: 13,
    color: "#999",         // xám
    textDecorationLine: "line-through",
    fontWeight: "400",     // không in đậm
  },

  newPrice: {
    fontSize: 16,
    fontWeight: "semibold",
    color: colors.primary,
  },

  primaryText: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primary,
  },
});
