import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AddCategoryScreen from "../screens/admin/AddCategoryScreen";
import AddProductScreen from "../screens/admin/AddProductScreen";
import DashboardScreen from "../screens/admin/DashboardScreen";
import EditCategoryScreen from "../screens/admin/EditCategoryScreen";
import EditProductScreen from "../screens/admin/EditProductScreen";
import ViewCategoryScreen from "../screens/admin/ViewCategoryScreen";
import ViewOrderDetailScreen from "../screens/admin/ViewOrderDetailScreen";
import ViewOrdersScreen from "../screens/admin/ViewOrdersScreen";
import ViewProductScreen from "../screens/admin/ViewProductScreen";
import ViewUsersScreen from "../screens/admin/ViewUsersScreen";
import ForgetPasswordScreen from "../screens/auth/ForgetPasswordScreen";
import LoginScreen from "../screens/auth/LoginScreen";
import SignupScreen from "../screens/auth/SignupScreen";
import Splash from "../screens/auth/Splash";
import MyAccountScreen from "../screens/profile/MyAccountScreen";
import MyWishlistScreen from "../screens/profile/MyWishlistScreen";
import UpdatePasswordScreen from "../screens/profile/UpdatePasswordScreen";
import ARScreen from "../screens/user/AR/ARScreen";
import CartScreen from "../screens/user/CartScreen";
import CategoriesScreen from "../screens/user/CategoriesScreen";
import CheckoutScreen from "../screens/user/CheckoutScreen.js";
import MyOrderDetailScreen from "../screens/user/MyOrderDetailScreen";
import MyOrderScreen from "../screens/user/MyOrderScreen";
import OrderConfirmScreen from "../screens/user/OrderConfirmScreen";
import ProductDetailScreen from "../screens/user/ProductDetailScreen";
import Tabs from "./tabs/Tabs";

const Stack = createNativeStackNavigator();

const Routes = () => {
  return (
    <Stack.Navigator
      initialRouteName="splash"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="splash" component={Splash} />
      <Stack.Screen name="login" component={LoginScreen} />
      <Stack.Screen name="signup" component={SignupScreen} />
      <Stack.Screen name="forgetpassword" component={ForgetPasswordScreen} />
      <Stack.Screen name="updatepassword" component={UpdatePasswordScreen} />
      <Stack.Screen name="myaccount" component={MyAccountScreen} />
      <Stack.Screen name="mywishlist" component={MyWishlistScreen} />
      <Stack.Screen name="dashboard" component={DashboardScreen} />
      <Stack.Screen name="addproduct" component={AddProductScreen} />
      <Stack.Screen name="viewproduct" component={ViewProductScreen} />
      <Stack.Screen name="editproduct" component={EditProductScreen} />
      <Stack.Screen name="tab" component={Tabs} />
      <Stack.Screen name="cart" component={CartScreen} />
      <Stack.Screen name="checkout" component={CheckoutScreen} />
      <Stack.Screen name="orderconfirm" component={OrderConfirmScreen} />
      <Stack.Screen name="productdetail" component={ProductDetailScreen} />
      <Stack.Screen name="ar" component={ARScreen} />
      <Stack.Screen name="vieworder" component={ViewOrdersScreen} />
      <Stack.Screen name="vieworderdetails" component={ViewOrderDetailScreen} />
      <Stack.Screen name="myorder" component={MyOrderScreen} />
      <Stack.Screen name="myorderdetail" component={MyOrderDetailScreen} />
      <Stack.Screen name="viewcategories" component={ViewCategoryScreen} />
      <Stack.Screen name="addcategories" component={AddCategoryScreen} />
      <Stack.Screen name="editcategories" component={EditCategoryScreen} />
      <Stack.Screen name="viewusers" component={ViewUsersScreen} />
      <Stack.Screen name="categories" component={CategoriesScreen} />
    </Stack.Navigator>
  );
};

export default Routes;