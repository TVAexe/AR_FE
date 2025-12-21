import { useNavigation } from '@react-navigation/native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import * as MediaLibrary from 'expo-media-library';
import React, { useRef, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Dùng thư viện mới
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import * as actionCreators from "../../../states/actionCreaters/actionCreaters";
import ProductInfoOverlay from './ProductInfoOverlay';
import Scene from './Scene';

interface ARScreenProps {
  route: {
    params: {
      product?: any;
      glbUrl?: string;
    };
  };
}

export default function ARScreen({ route }: ARScreenProps) {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const navigatorRef = useRef<any>(null);
  const flashAnim = useRef(new Animated.Value(0)).current; // Dùng cho hiệu ứng nháy màn hình

  const modelUrl =
    route?.params?.glbUrl ||
    'https://funiture-shop-storage.s3.ap-southeast-1.amazonaws.com/chair%20GLB.glb';

  const [permissionResponse, requestPermission] = MediaLibrary.usePermissions();

  const [scaleSignal, setScaleSignal] = useState(0);
  const [rotateSignal, setRotateSignal] = useState(0);
  const [resetSignal, setResetSignal] = useState(0);

  const dispatch = useDispatch();
  const { addCartItem } = bindActionCreators(actionCreators, dispatch);
  const cartProduct = useSelector((state: any) => state.product);


  const triggerFlash = () => {
    flashAnim.setValue(1);
    Animated.timing(flashAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const takeScreenshot = async () => {
    if (!navigatorRef.current) return;
    try {
      if (permissionResponse?.status !== 'granted') {
        const { status } = await requestPermission();
        if (status !== 'granted') return;
      }
      
      const result = await navigatorRef.current._takeScreenshot("AR_Capture", true);
      if (result.success) {
        triggerFlash();
        await MediaLibrary.saveToLibraryAsync(result.url);
        Alert.alert("Lưu thành công", "Ảnh đã có trong thư viện của bạn.");
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chụp ảnh.");
    }
  };

  const handleAddToCart = () => {
    if (!route?.params?.product) return;

    const product = route.params.product;

    const currentPrice = product.oldPrice *  (1 - product.saleRate / 100) || 0; 
    const itemToAdd = {
      ...product,
      id: product.id || product._id,
      price: currentPrice,
      image: product.imageUrl?.[0] || "",
      quantity: 1,
      countInStock: product.quantity,
      maxQuantity: product.quantity,
    };

    addCartItem(itemToAdd);

    Alert.alert("Thành công", "Sản phẩm đã được thêm vào giỏ hàng");
  };

  
  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        ref={navigatorRef}
        autofocus
        initialScene={{ scene: Scene as any }}
        viroAppProps={{ 
          glbUrl: modelUrl,
          scaleSignal,
          rotateSignal,
          resetSignal,
         }}
        style={{ flex: 1 }}
      />

      <Animated.View 
        pointerEvents="none"
        style={[styles.flashOverlay, { opacity: flashAnim }]} 
      />

      {/* ================= UI OVERLAY ================= */}
      <View
        style={[
          styles.overlay,
          { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 16 },
        ]}
      >
        {/* ===== HEADER (TOP) ===== */}
        <View style={styles.header}>
          <ProductInfoOverlay
            name={route?.params?.product?.name || 'Product'}
            price={route?.params?.product?.oldPrice || 0}
            saleRate={route?.params?.product?.saleRate || 0}
          />

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* ===== CAPTURE BUTTON (RIGHT - CENTER) ===== */}
        <View style={styles.captureWrapper}>
          <TouchableOpacity
            style={styles.captureButton}
            onPress={takeScreenshot}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>

        {/* ===== BOTTOM PANEL ===== */}
        <View style={[styles.bottomPanel, { bottom: insets.bottom + 24 }]}>
          {/* Instruction */}
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Tìm mặt phẳng và đặt vật thể
            </Text>
            <Text style={styles.instructionText}>
              Dùng 2 ngón tay để xoay / phóng to
            </Text>
          </View>

          {/* Control Panel */}
          <View style={styles.controlPanelInline}>
            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setScaleSignal((v) => v + 1)}
            >
              <Text style={styles.controlText}>＋</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setScaleSignal((v) => v - 1)}
            >
              <Text style={styles.controlText}>－</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setRotateSignal((v) => v + 1)}
            >
              <Text style={styles.controlText}>⟳ 45°</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.controlBtn}
              onPress={() => setResetSignal((v) => v + 1)}
            >
              <Text style={styles.controlText}>Reset</Text>
            </TouchableOpacity>
          </View>
          
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={handleAddToCart}
          >
            <Text style={styles.addToCartText}>🛒</Text>
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  /* ===== ROOT ===== */
  container: {
    flex: 1,
    backgroundColor: '#000',
  },

  /* ===== FLASH EFFECT ===== */
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    zIndex: 999,
  },

  /* ===== OVERLAY WRAPPER ===== */
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 20,
  },

  /* ===== HEADER ===== */
  header: {
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },

  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  backText: {
    color: 'white',
    fontSize: 18,
  },

  /* ===== RIGHT STACK (CAPTURE + INSTRUCTION + CONTROLS) ===== */
  rightStack: {
    position: 'absolute',
    right: 16,
    top: '35%',              // giữa màn hình
    alignItems: 'center',
  },

  /* ===== CAPTURE BUTTON ===== */
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 4,
    borderColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },

  captureButtonInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
  },

  /* ===== INSTRUCTION ===== */
  instructionContainer: {
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 18,
    marginBottom: 14,
  },

  instructionText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },

  /* ===== CONTROL PANEL ===== */
  controlPanelInline: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 12,
  },

  controlBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  controlText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 20,     
  },

  captureWrapper: {
    position: 'absolute',
    right: 20,
    top: '45%',
    alignItems: 'center',
  },

  bottomPanel: {
    position: 'absolute',
    bottom: 24,
    width: '100%',
    alignItems: 'center',
  },
  addToCartButton: {
    position: 'absolute',
    right: 20,
    bottom: 60,
    width: 70,
    height: 70,
    borderRadius: 40,
    backgroundColor: '#e35b2dff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  addToCartText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 32,
  },

});