import { StyleSheet, Image, TouchableOpacity, View } from "react-native";
import React, { useState, useEffect } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store"; // Import SecureStore

import HomeScreen from "../../screens/user/HomeScreen";
import { colors } from "../../constants";
import UserProfileScreen from "../../screens/profile/UserProfileScreen";
import MyOrderScreen from "../../screens/user/MyOrderScreen";
import CategoriesScreen from "../../screens/user/CategoriesScreen";

// Import Icons
import HomeIconActive from "../../assets/icons/bar_home_icon_active.png";
import HomeIcon from "../../assets/icons/bar_home_icon.png";
import userIcon from "../../assets/icons/bar_profile_icon.png";
import userIconActive from "../../assets/icons/bar_profile_icon_active.png";

const Tab = createBottomTabNavigator();

const Tabs = ({ navigation, route }) => {
  // 1. Khởi tạo state user, ưu tiên lấy từ params, nếu không có thì null
  const [user, setUser] = useState(route.params?.user || null);

  // 2. useEffect để check user nếu params bị null (Trường hợp reload hoặc reset nav)
  useEffect(() => {
    const checkUser = async () => {
      if (!user) {
        try {
          const value = await SecureStore.getItemAsync("authUser");
          if (value) {
            setUser(JSON.parse(value));
          } else {
            // Nếu không tìm thấy user trong máy -> Về màn hình login
            navigation.replace("login");
          }
        } catch (error) {
          console.log("Tabs: Error fetching user", error);
        }
      }
    };
    checkUser();
  }, [user]); // Chạy lại nếu user thay đổi

  // Nếu chưa load được user thì khoan hãy render Tab (tránh lỗi undefined bên trong các màn con)
  if (!user) {
    return <View style={{flex:1, backgroundColor: colors.light}} />; 
  }

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarStyle: {
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: colors.white,
          height: 60, // Tăng chiều cao một chút cho đẹp
          paddingBottom: 5
        },

        tabBarIcon: ({ focused }) => {
          let routename = route.name;
          if (routename == "home") {
            return (
              <TouchableOpacity disabled>
                {focused == true ? (
                  <Image source={HomeIconActive} style={styles.tabIconStyle} />
                ) : (
                  <Image source={HomeIcon} style={styles.tabIconStyle} />
                )}
              </TouchableOpacity>
            );
          } else if (routename == "categories") {
            return (
              <TouchableOpacity disabled>
                {/* Đã sửa icon ios-apps-sharp thành apps-sharp */}
                <Ionicons
                  name={focused ? "apps-sharp" : "apps-outline"}
                  size={29}
                  color={focused ? colors.primary : colors.muted}
                />
              </TouchableOpacity>
            );
          } else if (routename == "myorder") {
            return (
              <TouchableOpacity disabled>
                <Ionicons
                  name={focused ? "cart" : "cart-outline"}
                  size={29}
                  color={focused ? colors.primary : colors.muted}
                />
              </TouchableOpacity>
            );
          } else if (routename == "user") {
            return (
              <TouchableOpacity disabled>
                {focused == true ? (
                  <Image source={userIconActive} style={styles.tabIconStyle} />
                ) : (
                  <Image source={userIcon} style={styles.tabIconStyle} />
                )}
              </TouchableOpacity>
            );
          }
        },
      })}
    >
      <Tab.Screen
        name="home"
        component={HomeScreen}
        initialParams={{ user: user }}
      />
      <Tab.Screen
        name="categories"
        component={CategoriesScreen}
        initialParams={{ user: user }}
      />
      <Tab.Screen
        name="myorder"
        component={MyOrderScreen}
        initialParams={{ user: user }}
      />
      <Tab.Screen
        name="user"
        component={UserProfileScreen}
        initialParams={{ user: user }}
      />
    </Tab.Navigator>
  );
};

export default Tabs;

const styles = StyleSheet.create({
  tabIconStyle: {
    width: 25, // Đã chỉnh lại size icon cho phù hợp, 10 bé quá
    height: 25,
    resizeMode: "contain",
  },
});
