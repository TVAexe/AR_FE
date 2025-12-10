import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import cartIcon from "../../assets/icons/cart_beg_active.png";
import CartProductList from "../../components/CartProductList/CartProductList";
import CustomButton from "../../components/CustomButton";
import { colors } from "../../constants";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";

const CartScreen = ({ navigation }) => {
  const cartproduct = useSelector((state) => state.product);
  
  const [totalPrice, setTotalPrice] = useState(0);
  const [refresh, setRefresh] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const dispatch = useDispatch();

  const { removeCartItem, increaseCartItemQuantity, decreaseCartItemQuantity } =
    bindActionCreators(actionCreaters, dispatch);

  const deleteItem = (id) => {
    removeCartItem(id);
  };

  const increaseQuantity = (id, quantity, availableQuantity) => {
    if (availableQuantity > quantity) {
      increaseCartItemQuantity({ id: id, type: "increase" });
      setRefresh(!refresh);
    }
  };

  const decreaseQuantity = (id, quantity) => {
    if (quantity > 1) {
      decreaseCartItemQuantity({ id: id, type: "decrease" });
      setRefresh(!refresh);
    } else {
      deleteItem(id);
    }
  };

  const toggleCheckItem = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Tính tổng tiền cho các sản phẩm được chọn
  useEffect(() => {
    const total = cartproduct.reduce((accumulator, object) => {
      if (checkedItems[object._id]) {
        // Sử dụng giá thực tế (price) đã được tính toán trong Reducer
        // Nếu không có price thì fallback về oldPrice
        const unitPrice = object.price || object.oldPrice || 0;
        return accumulator + unitPrice * object.quantity;
      }
      return accumulator;
    }, 0);
    
    setTotalPrice(total);
  }, [cartproduct, refresh, checkedItems]);

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <View style={styles.container}>
      <StatusBar></StatusBar>
      <View style={styles.topBarContainer}>
        <View style={styles.cartInfoContainerTopBar}>
          <TouchableOpacity
            onPress={() => {
              navigation.goBack();
            }}
          >
            <Ionicons
              name="arrow-back-circle-outline"
              size={30}
              color={colors.muted}
            />
          </TouchableOpacity>
          <View style={styles.cartInfoTopBar}>
            <Text>Your Cart</Text>
            <Text>{cartproduct.length} Items</Text>
          </View>
        </View>

        <View></View>
        <TouchableOpacity>
          <Image source={cartIcon} />
        </TouchableOpacity>
      </View>
      {cartproduct.length === 0 ? (
        <View style={styles.cartProductListContiainerEmpty}>
          <Text style={styles.secondaryTextSmItalic}>"Cart is empty"</Text>
        </View>
      ) : (
        <ScrollView style={styles.cartProductListContiainer}>
          {cartproduct.map((item, index) => (
            <CartProductList
              key={index}
              index={index}
              image={item.imageUrl?.[0] || ''} // Đã fix lấy ảnh đầu tiên
              title={item.title}
              
              // TRUYỀN CẢ 2 LOẠI GIÁ
              price={item.oldPrice * (1-item.saleRate)} // Giá thực tế (đã giảm)
              oldPrice={item.oldPrice} // Giá gốc (để gạch ngang nếu cần)
              
              quantity={item.quantity}
              isChecked={checkedItems[item._id] || false}
              onToggleCheck={() => toggleCheckItem(item._id)}
              onPressIncrement={() => {
                increaseQuantity(
                  item._id,
                  item.quantity,
                  item.availableQuantity // Sửa lỗi chính tả available -> avaiableQuantity (theo Reducer)
                );
              }}
              onPressDecrement={() => {
                decreaseQuantity(item._id, item.quantity);
              }}
              handleDelete={() => {
                deleteItem(item._id);
              }}
            />
          ))}
          <View style={styles.emptyView}></View>
        </ScrollView>
      )}
      <View style={styles.cartBottomContainer}>
        <View style={styles.cartBottomLeftContainer}>
          <View style={styles.IconContainer}>
            <MaterialIcons
              name="featured-play-list"
              size={24}
              color={colors.primary}
            />
          </View>
          <View>
            <Text style={styles.cartBottomPrimaryText}>Total ({checkedCount} items)</Text>
            {/* Format giá tiền */}
            <Text style={styles.cartBottomSecondaryText}>{totalPrice.toFixed(2)}$</Text>
          </View>
        </View>
        <View style={styles.cartBottomRightContainer}>
          {checkedCount > 0 ? (
            <CustomButton
              text={"Checkout"}
              onPress={() => {
                // Lọc ra các sản phẩm được chọn
                const selectedItems = cartproduct.filter(item => checkedItems[item._id]);
                // Truyền sang CheckoutScreen thông qua params 'items'
                navigation.navigate("checkout", { items: selectedItems }); 
              }}
            />
          ) : (
            <CustomButton
              text={"Checkout"}
              disabled={true}
              onPress={() => { }}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default CartScreen;

const styles = StyleSheet.create({
  // ... (Styles giữ nguyên như cũ)
  container: {
    width: "100%",
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingBottom: 0,
    flex: 1,
  },
  topBarContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  toBarText: {
    fontSize: 15,
    fontWeight: "600",
  },
  cartProductListContiainer: { width: "100%", padding: 20 },
  cartProductListContiainerEmpty: {
    width: "100%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  secondaryTextSmItalic: {
    fontStyle: "italic",
    fontSize: 15,
    color: colors.muted,
  },
  cartBottomContainer: {
    width: "100%",
    height: 120,
    display: "flex",
    backgroundColor: colors.white,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    elevation: 3,
    justifyContent: "space-between",
    flexDirection: "row",
    alignItems: "center",
  },
  cartBottomLeftContainer: {
    padding: 20,
    display: "flex",
    justifyContent: "space-between",
    flexDirection: "column",
    alignItems: "center",
    width: "40%",
    height: "100%",
  },
  cartBottomRightContainer: {
    padding: 30,
    display: "flex",
    justifyContent: "flex-end",
    flexDirection: "column",
    alignItems: "center",
    width: "60%",
    height: "100%",
  },
  cartBottomPrimaryText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  cartBottomSecondaryText: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  emptyView: {
    width: "100%",
    height: 20,
  },
  IconContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.light,
    height: 40,
    width: 40,
    borderRadius: 5,
  },
  cartInfoContainerTopBar: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  cartInfoTopBar: {
    justifyContent: "center",
    alignItems: "flex-start",
    marginLeft: 5,
  },
});