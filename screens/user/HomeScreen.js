import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";
import CategoryList from "../../components/HomeScreen/CategoryList";
import HomeHeader from "../../components/HomeScreen/HomeHeader";
import NewArrivals from "../../components/HomeScreen/NewArrivals";
import PromotionSlider from "../../components/HomeScreen/PromotionSlider";
import SearchBar from "../../components/HomeScreen/SearchBar";
import { colors, network } from "../../constants";
import { category, slides } from "../../constants/AppData";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";

const HomeScreen = ({ navigation, route }) => {
  const cartproduct = useSelector((state) => state.product);
  const dispatch = useDispatch();

  const { addCartItem } = bindActionCreators(actionCreaters, dispatch);

  const { user } = route.params;
  const [products, setProducts] = useState([]);
  const [refeshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [userInfo, setUserInfo] = useState({});
  const [searchItems, setSearchItems] = useState([]);

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
    addCartItem(product);
  };

  var headerOptions = {
    method: "GET",
    redirect: "follow",
  };

  const fetchProduct = () => {
    console.log("Fetching products from:", `${network.serverip}/products`);
    fetch(`${network.serverip}/products`, headerOptions)
      .then((response) => response.json())
      .then((result) => {
        console.log("Fetch result:", result);
        if (result.success) {
          setProducts(result.data);
          setError("");
          console.log("Products loaded:", result.data.length);

          let payload = [];
          result.data.forEach((cat, index) => {
            let searchableItem = { ...cat, id: index + 1, name: cat.title };
            payload.push(searchableItem);
          });

          setSearchItems(payload);
        } else {
          setError(result.message);
          console.log("Fetch error message:", result.message);
        }
      })
      .catch((error) => {
        setError(error.message);
        console.log("Fetch error:", error);
      });
  };

  const handleOnRefresh = () => {
    setRefreshing(true);
    fetchProduct();
    setRefreshing(false);
  };

  useEffect(() => {
    console.log("HomeScreen useEffect - user:", user);
    convertToJSON(user);
    fetchProduct();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={colors.light} barStyle="dark-content" translucent={false} />


      <HomeHeader navigation={navigation} cartproduct={cartproduct} />

      <View style={styles.bodyContainer}>
        {/* Search bar với dropdown cần zIndex cao */}
        <View style={{ zIndex: 50 }}>
          <SearchBar
            searchItems={searchItems}
            handleProductPress={handleProductPress}
          />
        </View>

        <ScrollView
          nestedScrollEnabled={true}
          contentContainerStyle={{ paddingTop: 0 }}
          style={{ zIndex: 1 }}
        >
          <View style={{ marginTop: 10 }}>
            <PromotionSlider slides={slides} />
          </View>

          <CategoryList category={category} navigation={navigation} />

          <NewArrivals
            products={products}
            handleProductPress={handleProductPress}
            handleAddToCat={handleAddToCart}
            refreshing={refeshing}
            handleOnRefresh={handleOnRefresh}
          />
        </ScrollView>
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
});
