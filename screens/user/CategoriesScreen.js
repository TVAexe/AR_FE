import React, { useEffect, useState } from "react";
import {
    Dimensions,
    FlatList,
    Image,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { getCategories } from "@/api/categoriesAPI";
import { getProducts } from "@/api/productsAPI";
import { Ionicons } from "@expo/vector-icons";
import { useDispatch, useSelector } from "react-redux";
import { bindActionCreators } from "redux";

import cartIcon from "../../assets/icons/cart_beg.png";
import emptyBox from "../../assets/image/emptybox.png";

import CustomIconButton from "../../components/CustomIconButton/CustomIconButton";
import ProductCard from "../../components/ProductCard/ProductCard";
import { colors } from "../../constants";
import * as actionCreaters from "../../states/actionCreaters/actionCreaters";

const CategoriesScreen = ({ navigation, route }) => {
    const { categoryID } = route.params;

    const [isLoading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [foundItems, setFoundItems] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const [selectedTab, setSelectedTab] = useState();
    const [categories, setCategories] = useState([]);

    const [windowWidth] = useState(Dimensions.get("window").width);
    const windowHeight = Dimensions.get("window").height;

    const cartproduct = useSelector((state) => state.product);
    const dispatch = useDispatch();
    const { addCartItem } = bindActionCreators(actionCreaters, dispatch);

    // Fetch categories
    const fetchCategories = async () => {
        try {
            const { data } = await getCategories();
            setCategories(data);

            if (!selectedTab) {
                const firstCategoryId = data[0]?.id || data[0]?._id;
                console.log("Selected tab set to:", firstCategoryId);
                setSelectedTab(String(firstCategoryId));
            }
        } catch (error) {
        }
    };

    // Fetch products
    const fetchProducts = async () => {
        try {
            const response = await getProducts({
                page: 0,
                size: 100,
                categoryId: selectedTab ? Number(selectedTab) : null,
            })

            // Handle different API response structures
            const productsData = response.data?.result || response.result || response.data || response || [];

            setProducts(productsData);
            setFoundItems(productsData);
            setLoading(false)
        } catch (error) {
            console.log("Error fetching products", error);
            setLoading(false);
        }
    };

    // Pull to refresh
    const handleOnRefresh = () => {
        setRefreshing(true);
        fetchProducts();
        setRefreshing(false);
    };

    // Navigate to product detail
    const handleProductPress = (product) => {
        navigation.navigate("productdetail", { product });
    };

    // Add product to cart
    const handleAddToCart = (product) => {
        addCartItem(product);
    };

    // Filter products by search input


    // Fetch on initial render
    useEffect(() => {
        fetchCategories();
    }, []);

    // Fetch products when selectedTab changes
    useEffect(() => {
        if (selectedTab) {
            fetchProducts();
        }
    }, [selectedTab]);

    // Update selectedTab when navigating with categoryID
    useEffect(() => {
        const unsubscribe = navigation.addListener("focus", () => {
            if (categoryID) {
                setSelectedTab(categoryID);
            }
        });
        return unsubscribe;
    }, [navigation, categoryID]);

    return (
        <View style={styles.container}>
            <StatusBar />

            <View style={styles.topBarContainer}>
                <TouchableOpacity onPress={() => navigation.jumpTo("home")}>
                    <Ionicons name="arrow-back-circle-outline" size={30} color={colors.muted} />
                </TouchableOpacity>

                <View />

                <TouchableOpacity
                    style={styles.cartIconContainer}
                    onPress={() => navigation.navigate("cart")}
                >
                    {cartproduct?.length > 0 && (
                        <View style={styles.cartItemCountContainer}>
                            <Text style={styles.cartItemCountText}>{cartproduct.length}</Text>
                        </View>
                    )}
                    <Image source={cartIcon} />
                </TouchableOpacity>
            </View>

            <View style={styles.titleContainer}>
                <Text style={styles.titleText}>Categories</Text>
            </View>

            <View style={styles.bodyContainer}>
                <FlatList
                    data={categories}
                    keyExtractor={(item, index) => item._id || item.id || index.toString()}
                    horizontal
                    style={{ flexGrow: 0 }}
                    contentContainerStyle={{ padding: 10 }}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item: tab }) => {
                        const tabId = String(tab.id || tab._id);
                        return (
                            <CustomIconButton
                                key={tabId}
                                text={tab.name.charAt(0).toUpperCase() + tab.name.slice(1)}
                                active={selectedTab === tabId}
                                onPress={() => {
                                    console.log("Tab selected:", tabId, "Tab name:", tab.name);
                                    setSelectedTab(tabId);
                                }}
                            />
                        );
                    }}
                />

                {(() => {
                    const filteredItems = foundItems.filter((p) => {
                        const productCategoryId = String(p?.category?.id || p?.categoryId);
                        console.log("Product category ID:", productCategoryId, "Selected tab:", selectedTab, "Match:", productCategoryId === String(selectedTab));
                        return productCategoryId === String(selectedTab);
                    });
                    console.log("Filtered items count:", filteredItems.length, "Total items:", foundItems.length);
                    return filteredItems.length === 0;
                })() ? (
                    <View style={styles.noItemContainer}>
                        <View
                            style={{
                                justifyContent: "center",
                                alignItems: "center",
                                backgroundColor: colors.white,
                                height: 150,
                                width: 150,
                                borderRadius: 10,
                            }}
                        >
                            <Image
                                source={emptyBox}
                                style={{ height: 80, width: 80, resizeMode: "contain" }}
                            />
                            <Text style={styles.emptyBoxText}>There are no products in this category</Text>
                        </View>
                    </View>
                ) : (
                    <FlatList
                        data={foundItems.filter((p) => String(p?.category?.id || p?.categoryId) === String(selectedTab))}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={handleOnRefresh} />
                        }
                        keyExtractor={(item, index) => `${index}-${item._id || item.id}`}
                        numColumns={2}
                        contentContainerStyle={{ margin: 10 }}
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
                                    image={product.imageUrl[0] || ''}
                                    price={product.oldPrice || 0}
                                    quantity={product.quantity || 0}
                                    onPress={() => handleProductPress(product)}
                                    onPressSecondary={() => handleAddToCart(product)}
                                />
                                <View style={styles.emptyView} />
                            </View>
                        )}
                    />
                )}
            </View>
        </View>
    );
};

export default CategoriesScreen;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light,
    },
    topBarContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
    },
    titleContainer: {
        paddingHorizontal: 20,
        paddingBottom: 10,
    },
    titleText: {
        fontSize: 24,
        fontWeight: "bold",
        color: colors.dark,
    },
    bodyContainer: {
        flex: 1,
        backgroundColor: colors.light,
    },
    cartIconContainer: {
        justifyContent: "center",
        alignItems: "center",
    },
    cartItemCountContainer: {
        position: "absolute",
        zIndex: 10,
        top: -10,
        left: 10,
        justifyContent: "center",
        alignItems: "center",
        height: 22,
        width: 22,
        backgroundColor: colors.danger,
        borderRadius: 11,
    },
    cartItemCountText: {
        color: colors.white,
        fontWeight: "bold",
        fontSize: 10,
    },
    productCartContainer: {
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 10,
        margin: 5,
        padding: 5,
        paddingBottom: 0,
        paddingTop: 0,
        marginBottom: 0,
    },
    noItemContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyBoxText: {
        fontSize: 11,
        color: colors.muted,
        textAlign: "center",
    },
    emptyView: {
        height: 20,
    },
});
