import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";

import { getProductById } from "../../api/productsAPI";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import { colors } from "../../constants"; // Bỏ import network vì không dùng nữa
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";

const { width: windowWidth } = Dimensions.get("window");

// =========================================================================
// SUB-COMPONENTS
// =========================================================================

const ProductCarousel = ({ images, activeSlide, onScroll }) => (
  <View style={styles.carouselContainer}>
    <FlatList
      data={images}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      onScroll={onScroll}
      keyExtractor={(_, index) => index.toString()}
      renderItem={({ item }) => (
        <View style={styles.carouselItem}>
          <Image
            source={{ uri: item }}
            style={styles.carouselImage}
            onError={(e) => console.log("Lỗi load ảnh:", e.nativeEvent.error)}
          />
        </View>
      )}
    />
    <View style={styles.pagination}>
      {images.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === activeSlide ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  </View>
);

const PurchaseModal = ({
  visible,
  onClose,
  product,
  quantity,
  setQuantity,
  onConfirm,
  actionType,
  currentPrice,
  image,
}) => {
  if (!visible || !product) return null;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableWithoutFeedback>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Image source={{ uri: image }} style={styles.modalThumb} />
              <View style={styles.modalInfo}>
                <Text style={styles.modalPrice}>
                  ${currentPrice.toFixed(2)}
                </Text>
                <Text style={styles.modalStock}>Stock: {product.quantity}</Text>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={colors.muted} />
              </TouchableOpacity>
            </View>
            <View style={styles.divider} />
            <View style={styles.quantitySection}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.quantityControl}>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Ionicons name="remove" size={20} color={colors.dark} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{quantity}</Text>
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() =>
                    setQuantity((q) => (q < product.quantity ? q + 1 : q))
                  }
                >
                  <Ionicons name="add" size={20} color={colors.dark} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity style={styles.confirmBtn} onPress={onConfirm}>
              <Text style={styles.confirmBtnText}>
                {actionType === "buy" ? "Buy Now" : "Add to Cart"}
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </TouchableOpacity>
    </Modal>
  );
};

// =========================================================================
// MAIN SCREEN
// =========================================================================

const ProductDetailScreen = ({ navigation, route }) => {
  const { product: initialProduct } = route.params;
  const dispatch = useDispatch();
  const { addCartItem } = bindActionCreators(actionCreaters, dispatch);
  const cartProduct = useSelector((state) => state.product);

  const [productDetail, setProductDetail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSlide, setActiveSlide] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [actionType, setActionType] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setIsLoading(true);
        const productId = initialProduct.id || initialProduct._id;
        const response = await getProductById(productId);
        setProductDetail(response.data || response);
      } catch (err) {
        console.error("Error fetching detail:", err);
        setError("Không thể tải thông tin sản phẩm.");
      } finally {
        setIsLoading(false);
      }
    };
    if (initialProduct) fetchDetail();
  }, [initialProduct]);

  const currentPrice = useMemo(() => {
    if (!productDetail) return 0;
    if (productDetail.oldPrice && productDetail.saleRate) {
      return productDetail.oldPrice * (1 - productDetail.saleRate / 100);
    }
    return productDetail.oldPrice || 0;
  }, [productDetail]);

  // === ĐOẠN SỬA LẠI ===
  const productImages = useMemo(() => {
    // Nếu có ảnh -> dùng luôn mảng đó (vì là link S3 rồi)
    if (productDetail?.imageUrl && productDetail.imageUrl.length > 0) {
      return productDetail.imageUrl;
    }
    // Fallback ảnh rỗng
    return ["https://via.placeholder.com/400x300.png?text=No+Image"];
  }, [productDetail]);
  // ====================

  const handleScroll = useCallback(
    (event) => {
      const slide = Math.ceil(
        event.nativeEvent.contentOffset.x /
          event.nativeEvent.layoutMeasurement.width
      );
      if (slide !== activeSlide) setActiveSlide(slide);
    },
    [activeSlide]
  );

  const openOptionModal = (type) => {
    if (!productDetail || productDetail.quantity <= 0) return;
    setActionType(type);
    setQuantity(1);
    setModalVisible(true);
  };

  const handleConfirmAction = () => {
    if (!productDetail) return;
    const itemToAdd = {
      ...productDetail,
      id: productDetail.id,
      price: currentPrice,
      image: productDetail.imageUrl?.[0] || "",
      quantity: quantity,
      countInStock: productDetail.quantity,
      maxQuantity: productDetail.quantity,
    };
    addCartItem(itemToAdd);
    setModalVisible(false);
    if (actionType === "buy") {
      navigation.navigate("checkout", { items: [itemToAdd] });
    }
  };

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
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={28} color={colors.dark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Detail</Text>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.navigate("cart")}
        >
          {cartProduct.length > 0 && (
            <View style={styles.badgeContainer}>
              <Text style={styles.badgeText}>{cartProduct.length}</Text>
            </View>
          )}
          <Ionicons name="cart-outline" size={28} color={colors.dark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <ProductCarousel
          images={productImages}
          activeSlide={activeSlide}
          onScroll={handleScroll}
        />
        {error ? (
          <View style={{ padding: 20 }}>
            <CustomAlert message={error} type="error" />
          </View>
        ) : null}
        <View style={styles.infoContainer}>
          <Text style={styles.productName}>{productDetail?.name}</Text>
          <View style={styles.priceRow}>
            <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
              <Text style={styles.currentPrice}>
                ${currentPrice.toFixed(2)}
              </Text>
              {productDetail?.saleRate > 0 && (
                <Text style={styles.oldPrice}>${productDetail?.oldPrice}</Text>
              )}
            </View>
            {productDetail?.saleRate > 0 && (
              <View style={styles.saleBadge}>
                <Text style={styles.saleText}>
                  -{(productDetail.saleRate).toFixed(0)}%
                </Text>
              </View>
            )}
          </View>
          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>
            {productDetail?.description}
          </Text>
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.bottomBarContent}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.cartActionBtn]}
            onPress={() => openOptionModal("cart")}
            disabled={productDetail?.quantity <= 0}
          >
            <Ionicons name="cart-outline" size={24} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>
              Add to Cart
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.arActionBtn]}
            onPress={() =>
              navigation.navigate("ar", {
                product: productDetail,
                glbUrl:
                  productDetail?.arModel?.glbUrl ||
                  "https://funiture-shop-storage.s3.ap-southeast-1.amazonaws.com/chair%20GLB.glb",
              })
            }
            disabled={productDetail?.quantity <= 0}
          >
            <Ionicons name="scan-outline" size={24} color={colors.white} />
            <Text
              style={[
                styles.actionBtnText,
                { color: colors.white, marginLeft: 5 },
              ]}
            >
              Try AR
            </Text>
          </TouchableOpacity>

          {/* <View style={{width: 15}} />  */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              styles.buyActionBtn,
              productDetail?.quantity <= 0 && styles.disabledBtn,
            ]}
            onPress={() => openOptionModal("buy")}
            disabled={productDetail?.quantity <= 0}
          >
            <Text style={[styles.actionBtnText, { color: colors.white }]}>
              {productDetail?.quantity > 0 ? "Buy Now" : "Out of Stock"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <PurchaseModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        product={productDetail}
        quantity={quantity}
        setQuantity={setQuantity}
        onConfirm={handleConfirmAction}
        actionType={actionType}
        currentPrice={currentPrice}
        image={productImages[0]}
      />
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
    width: 40,
    height: 40,
    backgroundColor: colors.light,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: colors.dark },
  badgeContainer: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: colors.danger,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  badgeText: { color: "white", fontSize: 10, fontWeight: "bold" },

  // Carousel
  carouselContainer: { marginBottom: 10 },
  carouselImage: {
    width: windowWidth * 0.9,
    height: 350,
    resizeMode: "contain",
  },
  pagination: { flexDirection: "row", justifyContent: "center", marginTop: 10 },
  dot: { height: 8, borderRadius: 4, marginHorizontal: 4 },
  activeDot: { width: 24, backgroundColor: colors.primary },
  inactiveDot: { width: 8, backgroundColor: colors.muted },

  // Info
  infoContainer: { paddingHorizontal: 20, paddingTop: 10 },
  productName: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.dark,
    marginBottom: 5,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  currentPrice: { fontSize: 28, fontWeight: "bold", color: colors.primary },
  oldPrice: {
    fontSize: 18,
    color: colors.muted,
    textDecorationLine: "line-through",
    marginLeft: 10,
    marginBottom: 5,
  },
  saleBadge: {
    backgroundColor: "#FFEBEB",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  saleText: { color: colors.danger, fontWeight: "bold", fontSize: 14 },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 20,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.dark,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 15,
    color: "#666",
    lineHeight: 24,
    textAlign: "justify",
  },

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
    gap: 10,
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
  arActionBtn: {
    backgroundColor: colors.secondary || "#8E44AD", // Màu tím cho AR
    borderWidth: 1,
    borderColor: colors.secondary || "#8E44AD",
  },
  buyActionBtn: {
    backgroundColor: colors.primary,
  },
  actionBtnText: {
    fontSize: 13,
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
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  modalThumb: {
    width: 80,
    height: 80,
    borderRadius: 8,
    resizeMode: "contain",
    backgroundColor: colors.light,
    marginRight: 15,
  },
  modalInfo: {
    flex: 1,
    justifyContent: "center",
  },
  modalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 5,
  },
  modalStock: {
    fontSize: 14,
    color: colors.muted,
  },
  quantitySection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    textAlign: "center",
  },
  confirmBtn: {
    width: "100%",
    height: 50,
    backgroundColor: colors.primary,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBtnText: {
    color: colors.white,
    fontWeight: "bold",
    fontSize: 18,
  },
});
