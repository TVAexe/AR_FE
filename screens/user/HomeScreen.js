import { getCategories } from "@/api/categoriesAPI";
import { getProducts } from "@/api/productsAPI";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import CategoryList from "../../components/HomeScreen/CategoryList";
import HomeHeader from "../../components/HomeScreen/HomeHeader";
import PromotionSlider from "../../components/HomeScreen/PromotionSlider";
import SearchBar from "../../components/HomeScreen/SearchBar";
import ProductCard from "../../components/ProductCard";
import { colors } from "../../constants";
import { slides } from "../../constants/AppData";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";

const windowWidth = Dimensions.get('window').width;

const HomeScreen = ({ navigation, route }) => {
  const cartproduct = useSelector((state) => state.product);
  const dispatch = useDispatch();

  const { addCartItem } = bindActionCreators(actionCreaters, dispatch);

  const { user } = route.params;
  const [products, setProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const [searchItems, setSearchItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchKey, setSearchKey] = useState(0);

  const convertToJSON = (obj) => {
    try {
      setUserInfo(JSON.parse(obj));
    } catch (e) {
      setUserInfo(obj);
    }
  };

  const handleProductPress = (product) => {
    navigation.navigate("productdetail", { product: product });
  };

  const handleAddToCart = (product) => {
    // Chuẩn hóa dữ liệu trước khi gửi vào Redux
    const itemToAdd = {
      ...product,
      // Khi thêm nhanh từ Home, mặc định số lượng mua là 1
      quantity: 1, 
      // Map số lượng tồn kho từ API (product.quantity) sang biến countInStock để Redux hiểu
      countInStock: product.quantity 
    };
    console.log("Adding to cart:", itemToAdd);
    addCartItem(itemToAdd);
  };

  const fetchProduct = async () => {
    try {
      const response = await getProducts({
        page: 0,
        size: 100,
        categoryId: null,
      });

      const productsData = response.data?.result || response.result || response.data || response || [];
      setProducts(productsData);
      setError("");

      let payload = [];
      productsData.forEach((product, index) => {
        let searchableItem = { ...product, id: index + 1, name: product.name };
        payload.push(searchableItem);
      });

      setSearchItems(payload);
    } catch (error) {
      setError(error.message);
      console.log("Can't fetch products:", error);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data.data);

    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  }

  const handleOnRefresh = () => {
    setRefreshing(true);
    fetchProduct();
    fetchCategories();
    setRefreshing(false);
  };

  useEffect(() => {
    convertToJSON(user);
    fetchProduct();
    fetchCategories();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setSearchKey(prev => prev + 1);
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.light} barStyle="dark-content" translucent={false} />


      <HomeHeader navigation={navigation} cartproduct={cartproduct} />

      <View style={styles.bodyContainer}>
        <View style={{ zIndex: 50 }}>
          <SearchBar
            key={searchKey}
            searchItems={searchItems}
            handleProductPress={handleProductPress}
          />
        </View>

        <FlatList
          data={products}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleOnRefresh} />
          }
          keyExtractor={(item, index) => `${index}-${item._id || item.id}`}
          numColumns={2}
          contentContainerStyle={{ paddingBottom: 20, alignItems: 'center' }}
          ListHeaderComponent={
            <>
              <View style={{ marginTop: 10 }}>
                <PromotionSlider slides={slides} />
              </View>
              <CategoryList category={categories} navigation={navigation} />
              <View style={styles.titleContainer}>
                <Text style={styles.titleText}>Products</Text>
              </View>
            </>
          }
          renderItem={({ item: product }) => (
            <View
              style={[
                styles.productCartContainer,
                { width: (windowWidth - windowWidth * 0.1) / 2 },
              ]}
            >
              <ProductCard
                cardSize="large"
                name={product.name || ''}
                image={product.imageUrl?.[0] || ''}
                price={product.oldPrice * (1-product.saleRate) || 0}
                oldPrice={product.oldPrice || 0}
                quantity={product.quantity || 0}
                onPress={() => handleProductPress(product)}
                onPressSecondary={() => handleAddToCart(product)}
              />
            </View>
          )}
        />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirection: "column",
    backgroundColor: colors.light,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    flex: 1,
  },
  bodyContainer: {
    width: "100%",
    flexDirection: "column",
    flex: 1,
    paddingBottom: 0,
  },
  productCartContainer: {
    margin: 5,
  },
  titleContainer: {
    width: "100%",
    marginLeft: 10,
    marginTop: 10,
    marginBottom: 5,
  },
  titleText: {
    fontSize: 20,
    fontWeight: "bold",
  },
});
