import { StyleSheet, Text, View, StatusBar, Image } from "react-native";
import React, { useEffect, useState } from "react";
import CustomButton from "../../components/CustomButton";
import { colors } from "../../constants";
import SuccessImage from "../../assets/image/success.png"; 
import * as SecureStore from "expo-secure-store";

const OrderConfirmScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);

  // Lấy thông tin User để truyền lại cho màn hình Home
  useEffect(() => {
    const getUser = async () => {
      try {
        const value = await SecureStore.getItemAsync("authUser");
        if (value) {
          setUser(JSON.parse(value));
        }
      } catch (error) {
        console.log("Error getting user:", error);
      }
    };
    getUser();
  }, []);

  const handleBackToHome = () => {
    // Nếu không tìm thấy user trong storage -> Về login
    if (!user) {
        navigation.replace("login");
        return;
    }

    // Reset Stack và quay về Tab Home
    navigation.reset({
      index: 0,
      routes: [
        {
          name: "tab", 
          params: {
            screen: "home", 
            params: { user: user }, // Truyền user vào params của Home
          },
        },
      ],
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.light} />
      
      <View style={styles.imageContainer}>
        <Image source={SuccessImage} style={styles.image} />
      </View>
      
      <Text style={styles.successText}>Order Confirmed!</Text>
      <Text style={styles.subText}>Thank you for your purchase.</Text>
      
      <View style={styles.buttonContainer}>
        <CustomButton
          text={"Back to Home"}
          onPress={handleBackToHome}
        />
      </View>
    </View>
  );
};

export default OrderConfirmScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  imageContainer: {
    marginBottom: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: 300,
    height: 300,
    resizeMode: "contain",
  },
  successText: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primary,
    marginBottom: 10,
  },
  subText: {
    fontSize: 16,
    color: colors.muted,
    marginBottom: 40,
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    paddingHorizontal: 10,
  },
});
