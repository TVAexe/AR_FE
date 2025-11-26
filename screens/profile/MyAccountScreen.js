import { Ionicons,MaterialIcons } from "@expo/vector-icons";
import React,{ useState } from "react";
import {
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { deleteUser } from "../../api/profileAPI";
import OptionList from "../../components/OptionList/OptionList";
import UserProfileCard from "../../components/UserProfileCard/UserProfileCard";
import { colors } from "../../constants";

const MyAccountScreen = ({ navigation, route }) => {
  const [showBox, setShowBox] = useState(true);
  const [error, setError] = useState("");
  const { user } = route.params;
  const userID = user.id;

  //method for alert
  const showConfirmDialog = (id) => {
    return Alert.alert(
      "Are your sure?",
      "Are you sure you want to remove your account?",
      [
        {
          text: "Yes",
          onPress: () => {
            setShowBox(false);
            DeleteAccontHandle(id);
          },
        },
        {
          text: "No",
        },
      ]
    );
  };

  // Using profileAPI.deleteUser (axios) instead of manual fetch

  //method to delete the account using API call
  const DeleteAccontHandle = async (userID) => {
    try {
      await deleteUser(String(userID));
      navigation.navigate("login");
    } catch (err) {
      console.error("Delete user error:", err);
      setError(err.response?.data?.message || err.message || "Failed to delete account");
      setShowBox(true);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="auto"></StatusBar>
      <View style={styles.TopBarContainer}>
        <TouchableOpacity
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons
            name="arrow-back-circle-outline"
            size={30}
            color={colors.muted}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.screenNameContainer}>
        <Text style={styles.screenNameText}>My Account</Text>
      </View>
      <View style={styles.UserProfileCardContianer}>
        <UserProfileCard
          Icon={Ionicons}
          name={user["name"]}
          email={user["email"]}
        />
      </View>
      <View style={styles.OptionsContainer}>
        <OptionList
          text={"Change Password"}
          Icon={Ionicons}
          iconName={"key-sharp"}
          onPress={
            () =>
              navigation.navigate("updatepassword", {
                userID: userID,
              }) // navigate to updatepassword
          }
        />
        <OptionList
          text={"Delete My Account"}
          Icon={MaterialIcons}
          iconName={"delete"}
          type={"danger"}
          onPress={() => showConfirmDialog(userID)}
        />
      </View>
    </View>
  );
};

export default MyAccountScreen;

const styles = StyleSheet.create({
  container: {
    width: "100%",
    flexDirecion: "row",
    backgroundColor: colors.light,
    alignItems: "center",
    justifyContent: "flex-start",
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
  UserProfileCardContianer: {
    width: "100%",
    height: "25%",
  },
  screenNameContainer: {
    marginTop: 10,
    width: "100%",
    display: "flex",
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    marginBottom: 10,
  },
  screenNameText: {
    fontSize: 30,
    fontWeight: "800",
    color: colors.muted,
  },
  OptionsContainer: {
    width: "100%",
  },
});
