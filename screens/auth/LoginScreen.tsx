import NetInfo from "@react-native-community/netinfo";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import header_logo from "../../assets/logo/logo.png";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import CustomLoader from "../../components/CustomLoader";
import { colors, network } from "../../constants";
import {login} from "../../api/authAPI";

interface LoginScreenProps {
  navigation: any; // nếu bạn muốn kỹ hơn, dùng type từ react-navigation
}

const LoginScreen: React.FC<LoginScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  // Lắng nghe trạng thái mạng
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  //method to store the authUser to secure storage
  const storeUser = async (user: any) => {
    try {
      await SecureStore.setItemAsync("authUser", JSON.stringify(user));
    } catch (err: any) {
      console.log(err);
      setError(err.message);
    }
  };

  // const myHeaders = new Headers();
  // myHeaders.append("Content-Type", "application/json");

  // const raw = JSON.stringify({
  //   email: email,
  //   password: password,
  // });

  // const requestOptions = {
  //   method: "POST",
  //   headers: myHeaders,
  //   body: raw,
  //   redirect: "follow",
  // };

  //method to validate the user credentials and navigate to Home Screen / Dashboard
  const loginHandle = async () => {
    // if (!isConnected) return setError("No internet connection");

    setIsLoading(true);
    //[check validation] -- Start
    // if email does not contain @ sign
    if (!email) return setError("Please enter your email");
    if (!password) return setError("Please enter your password");
    if (!email.includes("@")) return setError("Email is not valid");
    // length of email must be greater than 5 characters
    if (email.length < 6) return setError("Email is too short");
    // length of password must be greater than 5 characters
    if (password.length < 6) return setError("Password must be at least 6 characters long");
    //[check validation] -- End

    try {
    const result = await login({ email: email, password: password });
    console.log(result)
    if (result.data.access_token) {
      // Store the entire user object, not just token
      await storeUser({
        token: result.data.access_token,
        user: result.data.user
      });
      navigation.replace("tab", { user: result.data.user });
    } else {
      setError("Invalid credentials. Please try again.");
    }
  } catch (err: any) {
    console.error("Login error:", err);
    setError(err.response?.data?.message || "Login failed. Please try again.");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <KeyboardAvoidingView
      // behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar />
      {!isConnected && (
        <View style={styles.noConnectionBanner}>
          <Text style={styles.noConnectionText}>No internet connection</Text>
        </View>
      )}
      <ScrollView style={{ flex: 1, width: "100%" }}>
        <CustomLoader visible={isLoading} label="Logging in..."/>
        <StatusBar></StatusBar>
        <View style={styles.welconeContainer}>
          <View>
            <Text style={styles.welcomeText}>Welcome to EasyBuy</Text>
            <Text style={styles.welcomeParagraph}>
              make your ecommerce easy
            </Text>
          </View>
          <View>
            <Image style={styles.logo} source={header_logo} />
          </View>
        </View>
        <View style={styles.screenNameContainer}>
          <Text style={styles.screenNameText}>Login</Text>
        </View>
        <View style={styles.formContainer}>
          <CustomAlert message={error} type={"error"} />
          <CustomInput
            value={email}
            setValue={setEmail}
            placeholder={"Email"}
            placeholderTextColor={colors.muted}
            radius={5}
          />
          <CustomInput
            value={password}
            setValue={setPassword}
            secureTextEntry={true}
            placeholder={"Password"}
            placeholderTextColor={colors.muted}
            radius={5}
          />
          <View style={styles.forgetPasswordContainer}>
            <Text
              onPress={() => navigation.navigate("forgetpassword")}
              style={styles.ForgetText}
            >
              Forget Password?
            </Text>
          </View>
        </View>
      </ScrollView>
      <View style={styles.buttomContainer}>
        <CustomButton text={"Login"} onPress={loginHandle} />
      </View>
      <View style={styles.bottomContainer}>
        <Text>Don't have an account?</Text>
        <Text
          onPress={() => navigation.navigate("signup")}
          style={styles.signupText}
        >
          signup
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    flex: 1,
  },
  welconeContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: "30%",
    // padding:15
  },
  formContainer: {
    flex: 3,
    justifyContent: "flex-start",
    alignItems: "center",
    display: "flex",
    width: "100%",
    padding: 5,
  },
  logo: {
    resizeMode: "contain",
    width: 80,
  },
  welcomeText: {
    fontSize: 42,
    fontWeight: "bold",
    color: colors.muted,
  },
  welcomeParagraph: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.primary_shadow,
  },
  forgetPasswordContainer: {
    marginTop: 10,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  ForgetText: {
    fontSize: 15,
    fontWeight: "600",
  },
  buttomContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
  },
  bottomContainer: {
    marginTop: 10,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  signupText: {
    marginLeft: 2,
    color: colors.primary,
    fontSize: 15,
    fontWeight: "600",
  },
  screenNameContainer: {
    marginTop: 10,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  screenNameText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.muted,
  },

  noConnectionBanner: { backgroundColor: "red", padding: 10, alignItems: "center" },
  noConnectionText: { color: "white", fontWeight: "bold" },
});
