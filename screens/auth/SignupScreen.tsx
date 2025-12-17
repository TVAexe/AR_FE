import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import header_logo from "../../assets/logo/logo.png";
import CustomAlert from "../../components/CustomAlert/CustomAlert";
import CustomButton from "../../components/CustomButton";
import CustomInput from "../../components/CustomInput";
import CustomLoader from "../../components/CustomLoader";
import { colors } from "../../constants";
import { register } from "../../api/authAPI";

interface SignupScreenProps {
  navigation: any;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>(""); // 📌 Thêm state phoneNumber
  const [error, setError] = useState<string>("");
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected ?? true);
    });
    return () => unsubscribe();
  }, []);

  const signUpHandle = async () => {
    if (!isConnected) {
      return setError("No internet connection");
    }

    setError("");

    // Validation
    if (!email) {
      return setError("Please enter your email");
    }
    if (!name) {
      return setError("Please enter your name");
    }
    if (!phoneNumber) { // 📌 Validate phone number
      return setError("Please enter your phone number");
    }
    if (phoneNumber.length < 10) { // 📌 Validate phone length
      return setError("Phone number must be at least 10 digits");
    }
    if (!password) {
      return setError("Please enter your password");
    }
    if (!email.includes("@")) {
      return setError("Email is not valid");
    }
    if (email.length < 6) {
      return setError("Email is too short");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters long");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    setIsLoading(true);

    try {
      const result = await register({
        username: name,
        email: email,
        password: password,
        phoneNumber: phoneNumber, // 📌 Gửi phoneNumber lên API
      });

      console.log("Register result:", result);

      if (result.success) {
        navigation.navigate("login");
      } else {
        setError(result.message || "Registration failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.response?.data?.message || err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container}>
      <StatusBar />
      <CustomLoader visible={isLoading} label="Creating account..." />
      
      {!isConnected && (
        <View style={styles.noConnectionBanner}>
          <Text style={styles.noConnectionText}>No internet connection</Text>
        </View>
      )}
      
      <View style={styles.TopBarContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={{ flex: 1, width: "100%" }}>
        <View style={styles.welconeContainer}>
          <Image style={styles.logo} source={header_logo} />
        </View>
        
        <View style={styles.screenNameContainer}>
          <View>
            <Text style={styles.screenNameText}>Sign up</Text>
          </View>
          <View>
            <Text style={styles.screenNameParagraph}>
              Create your account on EasyBuy to get an access to millions of products
            </Text>
          </View>
        </View>
        
        <View style={styles.formContainer}>
          <CustomAlert message={error} type={"error"} />
          
          <CustomInput
            value={name}
            setValue={setName}
            placeholder={"Name"}
            placeholderTextColor={colors.muted}
            radius={5}
          />
          
          <CustomInput
            value={email}
            setValue={setEmail}
            placeholder={"Email"}
            placeholderTextColor={colors.muted}
            radius={5}
          />
          
          {/* 📌 Thêm input Phone Number */}
          <CustomInput
            value={phoneNumber}
            setValue={setPhoneNumber}
            placeholder={"Phone Number"}
            placeholderTextColor={colors.muted}
            radius={5}
            keyboardType={"phone-pad"}
          />
          
          <CustomInput
            value={password}
            setValue={setPassword}
            secureTextEntry={true}
            placeholder={"Password"}
            placeholderTextColor={colors.muted}
            radius={5}
          />
          
          <CustomInput
            value={confirmPassword}
            setValue={setConfirmPassword}
            secureTextEntry={true}
            placeholder={"Confirm Password"}
            placeholderTextColor={colors.muted}
            radius={5}
          />
        </View>
      </ScrollView>
      
      <View style={styles.buttomContainer}>
        <CustomButton text={"Sign up"} onPress={signUpHandle} />
      </View>
      
      <View style={styles.bottomContainer}>
        <Text>Already have an account?</Text>
        <Text
          onPress={() => navigation.navigate("login")}
          style={styles.signupText}
        >
          Login
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

export default SignupScreen;

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    flex: 1,
  },
  TopBarContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  welconeContainer: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: 100,
  },
  formContainer: {
    flex: 2,
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
  buttomContainer: {
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
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  screenNameText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.muted,
  },
  screenNameParagraph: {
    marginTop: 5,
    fontSize: 15,
  },
  noConnectionBanner: { 
    backgroundColor: "red", 
    padding: 10, 
    alignItems: "center" 
  },
  noConnectionText: { 
    color: "white", 
    fontWeight: "bold" 
  },
});