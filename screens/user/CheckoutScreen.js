import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TextInput
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";

import BasicProductList from "../../components/BasicProductList/BasicProductList";
import CustomLoader from "../../components/CustomLoader";
import { colors } from "../../constants";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";

// IMPORT HÀM API BẠN VỪA VIẾT
import { createOrder } from "../../api/ordersAPI";

const CheckoutScreen = ({ navigation, route }) => {
  // 1. Nhận params (trường hợp bấm nút Buy Now)
  const { items: buyNowItems } = route.params || {};

  const cartproduct = useSelector((state) => state.product);
  const dispatch = useDispatch();
  const { emptyCart } = bindActionCreators(actionCreaters, dispatch);

  // --- STATE QUẢN LÝ ---
  const [modalVisible, setModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null); 

  // Form địa chỉ
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [zipcode, setZipcode] = useState("");

  // Chi phí
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  // Xác định danh sách sản phẩm
  const checkoutItems = buyNowItems && buyNowItems.length > 0 ? buyNowItems : cartproduct;
  const totalItems = checkoutItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  // --- USE EFFECT ---

  // 1. Lấy thông tin User
  useEffect(() => {
    const getUserData = async () => {
      try {
        const value = await SecureStore.getItemAsync("authUser");
        if (value) {
          const userObj = JSON.parse(value);
          setUserInfo(userObj);
        }
      } catch (error) {
        console.log("Error getting user data", error);
      }
    };
    getUserData();
  }, []);

  // 2. Cập nhật địa chỉ & Tính tổng tiền
  useEffect(() => {
    if (streetAddress && city && country) {
      setAddress(`${streetAddress}, ${city}, ${country}`);
    }

    const total = checkoutItems.reduce((acc, item) => {
      const saleRate = item.saleRate || 0;
      const oldPrice = Number(item.oldPrice) || 0;
      let finalPrice = oldPrice * (1 - saleRate);
      if (finalPrice === 0) finalPrice = Number(item.price) || 0;

      return acc + finalPrice * Number(item.quantity);
    }, 0);
    
    setTotalCost(total);
  }, [streetAddress, city, country, checkoutItems]);

  const logout = async () => {
    await SecureStore.deleteItemAsync("authUser");
    navigation.replace("login");
  };

  // Hàm hiển thị email/phone an toàn
  const getDisplayInfo = () => {
    if (!userInfo) return { email: "Loading...", phone: "" };
    const email = userInfo?.data?.user?.email || userInfo?.user?.email || userInfo?.email || "No Email";
    const phone = userInfo?.data?.user?.phoneNumber || userInfo?.user?.phoneNumber || userInfo?.phoneNumber || "";
    return { email, phone };
  };
  const displayInfo = getDisplayInfo();

  // --- HANDLE CHECKOUT (SỬ DỤNG HÀM CỦA BẠN) ---
  const handleCheckout = async () => {
    // 1. Validate Address
    if (!address || address.trim() === "") {
        Alert.alert("Missing Address", "Please add a shipping address.");
        setModalVisible(true);
        return;
    }

    setIsLoading(true);
    
    try {
        // 2. Chuẩn bị dữ liệu Order (Mapping)
        const itemsPayload = checkoutItems.map(item => ({
            productId: item.id || item._id, // Đảm bảo đúng field ID
            quantity: item.quantity
        }));

        const orderData = {
            shippingAddress: address,
            items: itemsPayload
        };

        console.log("Submitting Order:", orderData);

        // 3. GỌI API (Không cần truyền token, hàm createOrder tự xử lý)
        const result = await createOrder(orderData);

        console.log("Order Success:", result);
        setIsLoading(false);
        
        // 4. Xử lý thành công
        if (!buyNowItems) {
            emptyCart("empty"); // Xóa giỏ hàng nếu mua từ giỏ
        }
        
        navigation.replace("orderconfirm");

    } catch (error) {
        setIsLoading(false);
        console.error("Checkout Error:", error);
        
        // Xử lý lỗi từ Axios (thường nằm trong error.response.data)
        let errorMsg = "An error occurred";
        if (error.response && error.response.data) {
             errorMsg = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
        } else if (error.message) {
             errorMsg = error.message;
        }

        // Kiểm tra lỗi 403/401 hoặc User not logged in
        if (errorMsg.includes("User not logged in") || (error.response && error.response.status === 403)) {
            Alert.alert("Session Expired", "Please login again.");
            logout();
        } else {
            Alert.alert("Order Failed", errorMsg);
        }
    }
  };

  return (
    <View style={styles.container}>
      <CustomLoader visible={isLoading} label="Placing Order..." />
      <StatusBar />
      
      {/* HEADER */}
      <View style={styles.TopBarContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-circle-outline" size={30} color={colors.muted} />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <Text style={styles.screenNameText}>Checkout</Text>
        <Text style={styles.screenNameParagraph}>Review and complete your order</Text>
      </View>

      <ScrollView style={styles.bodyContainer} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* CARD 1: ADDRESS */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
             <Text style={styles.cardTitle}>Shipping Address</Text>
             <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Text style={{color: colors.primary, fontWeight: 'bold'}}>
                    {address ? "Edit" : "Add"}
                </Text>
             </TouchableOpacity>
          </View>
          {address ? (
             <Text style={styles.cardContent}>{address}</Text>
          ) : (
             <Text style={[styles.cardContent, {fontStyle: 'italic', color: colors.danger}]}>
                No address selected. Please add one.
             </Text>
          )}
        </View>

        {/* CARD 2: CONTACT */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Contact Info</Text>
          <Text style={styles.cardItem}>
             <Text style={styles.label}>Email: </Text>{displayInfo.email}
          </Text>
          {displayInfo.phone ? (
            <Text style={styles.cardItem}>
                <Text style={styles.label}>Phone: </Text>{displayInfo.phone}
            </Text>
          ) : null}
          <Text style={styles.cardItem}>
             <Text style={styles.label}>Payment: </Text>Cash On Delivery
          </Text>
        </View>

        {/* CARD 3: ITEMS & TOTALS */}
        <View style={styles.card}>
          <View style={styles.packageHeader}>
            <Text style={styles.cardTitle}>PACKAGE DETAILS</Text>
            <Text style={{color: colors.primary, fontWeight: 'bold'}}>{totalItems} Items</Text>
          </View>
          
          <View style={styles.productList}>
            {checkoutItems.map((product, index) => (
              <BasicProductList
                key={index}
                title={product.name || product.title}
                price={product.oldPrice * (1 - (product.saleRate || 0))} 
                oldPrice={product.oldPrice}
                quantity={product.quantity}
                image={product.imageUrl[0] || "https://via.placeholder.com/100"}
              />
            ))}
          </View>
          
          <View style={[styles.summaryRow, { marginTop: 15 }]}>
             <Text style={styles.label}>Subtotal:</Text>
             <Text style={styles.valueText}>{totalCost.toFixed(2)}$</Text>
          </View>
          <View style={styles.summaryRow}>
             <Text style={styles.label}>Delivery:</Text>
             <Text style={styles.valueText}>{deliveryCost}$</Text>
          </View>
          <View style={[styles.totalRow, {marginTop: 10}]}>
             <Text style={[styles.label, {fontSize: 18}]}>Total:</Text>
             <Text style={[styles.totalValue, {fontSize: 18}]}> {(totalCost + deliveryCost).toFixed(2)}$</Text>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footerBar}>
        <TouchableOpacity 
            style={[styles.footerBtnFull, styles.buyBtn, !address && styles.disabledBtn]} 
            onPress={handleCheckout}
            disabled={!address}
        >
            <Text style={styles.buyBtnText}>Submit Order</Text>
        </TouchableOpacity>
      </View>

      {/* MODAL UPDATE ADDRESS */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(!modalVisible)}
      >
        <KeyboardAvoidingView 
             behavior={Platform.OS === "ios" ? "padding" : "height"}
             style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Address</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Country</Text>
                    <TextInput style={styles.inputField} value={country} onChangeText={setCountry} placeholder="e.g. Vietnam" placeholderTextColor="#999" />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>City</Text>
                    <TextInput style={styles.inputField} value={city} onChangeText={setCity} placeholder="e.g. Ho Chi Minh City" placeholderTextColor="#999" />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Street Address</Text>
                    <TextInput style={styles.inputField} value={streetAddress} onChangeText={setStreetAddress} placeholder="e.g. 123 Nguyen Hue" placeholderTextColor="#999" />
                </View>
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Zip Code</Text>
                    <TextInput style={styles.inputField} value={zipcode} onChangeText={setZipcode} placeholder="e.g. 70000" placeholderTextColor="#999" keyboardType="number-pad" />
                </View>

                <View style={styles.modalButtons}>
                    <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.modalBtn, styles.modalBtnCancel]}>
                        <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        onPress={() => {
                            if(!streetAddress || !city || !country) {
                                Alert.alert("Missing Info", "Please fill in all address fields.");
                                return;
                            }
                            setAddress(`${streetAddress}, ${city}, ${country}`);
                            setModalVisible(false);
                        }}
                        style={[styles.modalBtn, styles.modalBtnSave]}
                    >
                        <Text style={styles.modalBtnTextSave}>Save Address</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

export default CheckoutScreen;

const styles = StyleSheet.create({
  container: { backgroundColor: colors.light, flex: 1 },
  TopBarContainer: { width: "100%", flexDirection: "row", paddingHorizontal: 20, paddingTop: 20, justifyContent: 'flex-start' },
  screenNameContainer: { paddingHorizontal: 20, paddingBottom: 10, marginTop: 5 },
  screenNameText: { fontSize: 30, fontWeight: "700", color: colors.muted },
  screenNameParagraph: { fontSize: 15, color: "#666" },
  bodyContainer: { flex: 1, width: "100%", paddingHorizontal: 10 },
  card: { backgroundColor: colors.white, padding: 15, borderRadius: 10, elevation: 2, marginTop: 15 },
  cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  cardTitle: { fontSize: 18, fontWeight: "600", color: colors.muted },
  cardContent: { marginVertical: 3, color: colors.dark, fontSize: 15 },
  cardItem: { marginVertical: 5, color: colors.muted, fontSize: 15 },
  packageHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  label: { fontWeight: "600", color: colors.dark },
  productList: { backgroundColor: colors.white },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginVertical: 3 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderColor: colors.light },
  valueText: { color: colors.muted, fontWeight: '500' },
  totalValue: { fontWeight: "700", color: colors.primary },
  footerBar: { position: "absolute", bottom: 0, width: "100%", padding: 15, backgroundColor: colors.white, borderTopWidth: 0.5, borderColor: "#ccc" },
  footerBtnFull: { width: "100%", paddingVertical: 15, borderRadius: 10, alignItems: "center" },
  buyBtn: { backgroundColor: colors.primary },
  disabledBtn: { backgroundColor: colors.muted, opacity: 0.7 },
  buyBtnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center" },
  modalContent: { width: '90%', backgroundColor: colors.white, padding: 20, borderRadius: 20, elevation: 10 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: colors.dark, marginBottom: 20, textAlign: 'center' },
  inputGroup: { marginBottom: 15 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: colors.muted, marginBottom: 8, marginLeft: 4 },
  inputField: { backgroundColor: "#F5F5F5", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 15, fontSize: 16, color: colors.dark, borderWidth: 1, borderColor: "#E0E0E0" },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 10 },
  modalBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginHorizontal: 6 },
  modalBtnCancel: { backgroundColor: "#F0F0F0" },
  modalBtnSave: { backgroundColor: colors.primary },
  modalBtnTextCancel: { color: colors.muted, fontWeight: '700', fontSize: 15 },
  modalBtnTextSave: { color: "#fff", fontWeight: '700', fontSize: 15 }
});