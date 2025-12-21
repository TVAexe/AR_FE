import { useNavigation } from '@react-navigation/native';
import { ViroARSceneNavigator } from '@reactvision/react-viro';
import * as MediaLibrary from 'expo-media-library';
import React, { useRef } from 'react';
import { Alert, Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context'; // Dùng thư viện mới
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
  
  return (
    <View style={styles.container}>
      <ViroARSceneNavigator
        ref={navigatorRef}
        autofocus
        initialScene={{ scene: Scene as any }}
        viroAppProps={{ glbUrl: modelUrl }}
        style={{ flex: 1 }}
      />

      <Animated.View 
        pointerEvents="none"
        style={[styles.flashOverlay, { opacity: flashAnim }]} 
      />

      {/* --- UI OVERLAY --- */}
      <View style={[styles.overlay, { paddingTop: insets.top + 10, paddingBottom: insets.bottom + 20 }]}>
        
        {/* Header: Nút back và Thông tin sản phẩm */}
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

        {/* Hướng dẫn & Nút chụp */}
        <View style={styles.footer}>
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>Tìm mặt phẳng và đặt vật thể</Text>
            <Text style={styles.instructionText}>Dùng 2 ngón tay xoay/phóng</Text>
          </View>

          <TouchableOpacity style={styles.captureButton} onPress={takeScreenshot}>
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  flashOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'white',
    zIndex: 999,
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  header: { 
    position: 'absolute',
    top: 40,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center',
    marginRight: 10,
  },
  backText: { color: 'white', fontSize: 18 },
  productBadge: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.85)',
    padding: 10, borderRadius: 12,
  },
  productName: { fontSize: 15, fontWeight: 'bold' },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  priceText: { color: '#E44D26', fontWeight: 'bold' },
  saleBadge: { backgroundColor: '#E44D26', paddingHorizontal: 4, borderRadius: 4, marginLeft: 5 },
  saleText: { color: 'white', fontSize: 10, fontWeight: 'bold' },
  footer: { 
    position: 'absolute',
    bottom: 30,           
    right: 0,
    left: 0,
    alignItems: 'center', 
  },
  instructionContainer: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 10, borderRadius: 20,
    marginBottom: 20,
  },
  instructionText: { color: 'white', fontSize: 24 },
  captureButton: {
    width: 70, height: 70, borderRadius: 35,
    borderWidth: 4, borderColor: 'white',
    justifyContent: 'center', alignItems: 'center',
  },
  captureButtonInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'white' },
});