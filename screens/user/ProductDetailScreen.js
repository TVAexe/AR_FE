import {
  StyleSheet,
  Image,
  TouchableOpacity,
  View,
  StatusBar,
  Text,
  ActivityIndicator,
  ScrollView,
  FlatList,
  Dimensions,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { colors, network } from "../../constants";
import { useSelector, useDispatch } from "react-redux";
import { bindActionCreators } from "redux";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import { getProductById } from "../../api/productsAPI";

const { width: windowWidth } = Dimensions.get("window");

const ProductDetailScreen = ({ navigation, route }) => {
  const { product: initialProduct } = route.params;
  const cartproduct = useSelector((state) => state.product);
  const dispatch = useDispatch();
  const { addCartItem } = bindActionCreators(actionCreaters, dispatch);

  // --- STATE ---
  const [productDetail, setProductDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);
  const [error, setError] = useState("");

  // State cho Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1); // Số lượng khách muốn mua
  const [actionType, setActionType] = useState(null); // 'cart' hoặc 'buy'

  // --- 1. Fetch Data ---
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const productId = initialProduct.id || initialProduct._id;
        const response = await getProductById(productId);
        
        // Xử lý dữ liệu trả về
        const actualProduct = response.data || response;
        setProductDetail(actualProduct);
      } catch (err) {
        console.error("Error fetching detail:", err);
        setError("Không thể tải thông tin sản phẩm.");
      } finally {
        setIsLoading(false);
      }
    };
    if (initialProduct) fetchDetail();
  }, [initialProduct]);

  // --- 2. Logic Helpers ---
  const calculatePrice = () => {
    if (!productDetail) return 0;
    if (productDetail.oldPrice && productDetail.saleRate) {
      return productDetail.oldPrice * (1 - productDetail.saleRate);
    }
    return productDetail.oldPrice || 0;
  };
  const currentPrice = calculatePrice();

  const getImages = () => {
    if (productDetail?.imageUrl && productDetail.imageUrl.length > 0) {
      return productDetail.imageUrl.map(img => `${network.serverip}/uploads/${img}`);
    }
    return [`${network.serverip}/uploads/default.png`];
  };
  const productImages = getImages();

  // --- 3. Handlers ---
  
  // Mở Modal
  const openOptionModal = (type) => {
    // Nếu hết hàng thì không mở modal
    if (!productDetail || productDetail.quantity <= 0) return;
    
    setActionType(type);
    setQuantity(1); // Reset về 1 mỗi khi mở modal
    setModalVisible(true);
  };

  // Xác nhận hành động
  const handleConfirmAction = () => {
    if (!productDetail) return;

    // --- QUAN TRỌNG: Mapping dữ liệu chuẩn cho Redux ---
    const itemToAdd = {
      ...productDetail,
      id: productDetail.id,
      price: currentPrice,
      image: productDetail.imageUrl?.[0] || "",
      
      // Biến này là số lượng USER MUỐN MUA
      quantity: quantity, 

      // Biến này là TỒN KHO THỰC TẾ (Để Redux kiểm tra không bị Out of Stock ảo)
      countInStock: productDetail.quantity, 
      maxQuantity: productDetail.quantity 
    };

    console.log("Sending to Redux:", itemToAdd); // Debug log

    // Gửi sang Redux
    addCartItem(itemToAdd);

    setModalVisible(false);

    if (actionType === 'buy') {
      // Điều hướng đến Checkout, truyền kèm mảng chứa item vừa mua
      navigation.navigate("checkout", { items: [itemToAdd] });
    }
  };

  // Logic Slide ảnh
  const handleScroll = (event) => {
    const slide = Math.ceil(
      event.nativeEvent.contentOffset.x / event.nativeEvent.layoutMeasurement.width
    );
    if (slide !== activeSlide) setActiveSlide(slide);
  };

  // --- RENDER ---
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail</Text>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.navigate("cart")}>
          {cartproduct.length > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{cartproduct.length}</Text>
            </View>
          )}
          <Ionicons name="cart-outline" size={28} color={colors.dark} />
        </TouchableOpacity>
      </View>

      {/* BODY SCROLL */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Carousel */}
        <View style={styles.carouselContainer}>
          <FlatList
            data={productImages}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScroll}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={{ width: windowWidth, height: 350, alignItems: 'center', justifyContent: 'center' }}>
                <Image source={{ uri: item }} style={styles.carouselImage} />
              </View>
            )}
          />
          <View style={styles.pagination}>
            {productImages.map((_, index) => (
              <View key={index} style={[styles.dot, index === activeSlide ? styles.activeDot : styles.inactiveDot]} />
            ))}
          </View>
        </View>

        {error ? <View style={{padding: 20}}><CustomAlert message={error} type="error" /></View> : null}

        {/* Info */}
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{productDetail?.name}</Text>
          
          <View style={styles.priceRow}>
            <View style={{flexDirection: 'row', alignItems: 'flex-end'}}>
               <Text style={styles.currentPrice}>${currentPrice.toFixed(2)}</Text>
               {productDetail?.saleRate > 0 && (
                 <Text style={styles.oldPrice}>${productDetail?.oldPrice}</Text>
               )}
            </View>
            {productDetail?.saleRate > 0 && (
              <View style={styles.saleBadge}>
                <Text style={styles.saleText}>-{(productDetail.saleRate * 100).toFixed(0)}%</Text>
              </View>
            )}
          </View>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{productDetail?.description}</Text>
        </View>
      </ScrollView>

      {/* --- BOTTOM BAR --- */}
      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
            {/* Nút Thêm vào giỏ */}
            <TouchableOpacity 
                style={[styles.actionBtn, styles.cartActionBtn]}
                onPress={() => openOptionModal('cart')}
                disabled={productDetail?.quantity <= 0}
            >
                <Ionicons name="cart-outline" size={24} color={colors.primary} />
                <Text style={[styles.actionBtnText, {color: colors.primary}]}>Add to Cart</Text>
            </TouchableOpacity>

            <View style={{width: 15}} /> 

            {/* Nút Mua ngay */}
            <TouchableOpacity 
                style={[styles.actionBtn, styles.buyActionBtn, productDetail?.quantity <= 0 && styles.disabledBtn]}
                onPress={() => openOptionModal('buy')}
                disabled={productDetail?.quantity <= 0}
            >
                <Text style={[styles.actionBtnText, {color: colors.white}]}>
                    {productDetail?.quantity > 0 ? "Buy Now" : "Out of Stock"}
                </Text>
            </TouchableOpacity>
        </View>
      </View>

      {/* --- MODAL CHỌN SỐ LƯỢNG --- */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setModalVisible(false)} 
        >
            <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                    {/* Header Modal */}
                    <View style={styles.modalHeader}>
                        <Image source={{ uri: productImages[0] }} style={styles.modalThumb} />
                        <View style={styles.modalInfo}>
                            <Text style={styles.modalPrice}>${currentPrice.toFixed(2)}</Text>
                            <Text style={styles.modalStock}>Stock: {productDetail?.quantity}</Text>
                        </View>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Ionicons name="close" size={24} color={colors.muted} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.divider} />

                    {/* Bộ chọn số lượng */}
                    <View style={styles.quantitySection}>
                        <Text style={styles.sectionTitle}>Quantity</Text>
                        <View style={styles.quantityControl}>
                            <TouchableOpacity 
                                style={styles.qtyBtn} 
                                onPress={() => setQuantity(q => q > 1 ? q - 1 : 1)}
                            >
                                <Ionicons name="remove" size={20} color={colors.dark} />
                            </TouchableOpacity>
                            <Text style={styles.qtyText}>{quantity}</Text>
                            <TouchableOpacity 
                                style={styles.qtyBtn} 
                                onPress={() => {
                                    if (productDetail && quantity < productDetail.quantity) {
                                        setQuantity(q => q + 1);
                                    }
                                }}
                            >
                                <Ionicons name="add" size={20} color={colors.dark} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Nút Confirm */}
                    <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirmAction}>
                        <Text style={styles.confirmBtnText}>
                            {actionType === 'buy' ? "Buy Now" : "Add to Cart"}
                        </Text>
                    </TouchableOpacity>
                </View>
            </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

    </View>
  );
};

export default ProductDetailScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
  },
  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerBtn: {
    width: 40, height: 40, backgroundColor: colors.light, borderRadius: 12, justifyContent: "center", alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: colors.dark },
  badgeContainer: {
    position: "absolute", top: -5, right: -5, backgroundColor: colors.danger, borderRadius: 10, width: 20, height: 20, justifyContent: "center", alignItems: "center", zIndex: 10,
  },
  badgeText: { color: "white", fontSize: 10, fontWeight: "bold" },
  
  // Carousel
  carouselContainer: { marginBottom: 10 },
  carouselImage: { width: windowWidth * 0.9, height: 350, resizeMode: "contain" },
  pagination: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
  activeDot: { width: 24, backgroundColor: colors.primary },
  inactiveDot: { width: 8, backgroundColor: colors.muted },
  
  // Info
  infoContainer: { paddingHorizontal: 20, paddingTop: 10 },
  productName: { fontSize: 26, fontWeight: "bold", color: colors.dark, marginBottom: 5 },
  priceRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  currentPrice: { fontSize: 28, fontWeight: "bold", color: colors.primary },
  oldPrice: { fontSize: 18, color: colors.muted, textDecorationLine: "line-through", marginLeft: 10, marginBottom: 5 },
  saleBadge: { backgroundColor: "#FFEBEB", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: colors.danger },
  saleText: { color: colors.danger, fontWeight: "bold", fontSize: 14 },
  divider: { height: 1, backgroundColor: "#F0F0F0", marginBottom: 20, marginTop: 10 },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: colors.dark, marginBottom: 10 },
  descriptionText: { fontSize: 15, color: "#666", lineHeight: 24, textAlign: "justify" },

  // Bottom Bar
  bottomBar: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: colors.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 20, // Cho iPhone X+
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  bottomBarContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  cartActionBtn: {
    backgroundColor: "#FFF0E6", // Màu cam rất nhạt
    borderWidth: 1,
    borderColor: colors.primary,
  },
  buyActionBtn: {
    backgroundColor: colors.primary,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 5,
  },
  disabledBtn: {
    backgroundColor: colors.muted,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: 40,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: 'contain',
    backgroundColor: colors.light,
    marginRight: 15,
  },
  modalInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 5,
  },
  modalStock: {
    fontSize: 14,
    color: colors.muted,
  },
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
  },
  qtyBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 15,
    minWidth: 20,
    textAlign: 'center',
  },
  confirmBtn: {
    width: '100%',
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmBtnText: {
    color: colors.white,
    fontWeight: 'bold',
    fontSize: 18,
  },
});
