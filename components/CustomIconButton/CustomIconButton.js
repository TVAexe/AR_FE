import React from "react";
import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { colors } from "../../constants";


const CustomIconButton = ({ text, image, onPress, active }) => {
  return (
    <TouchableOpacity
      style={[
        styles.container,
        { backgroundColor: active ? colors.primary_light : colors.white },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.buttonText,
          { color: active ? colors.dark : colors.muted },
        ]}
      >
        {text}
      </Text>
    </TouchableOpacity>
  );
};


export default CustomIconButton;


const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
    height: 40,
    width: 110,
    elevation: 3,
    margin: 5,
  },
  buttonText: {
    fontSize: 14,
    color: colors.muted,
    fontWeight: "bold",
    textAlign: "center",
    flexShrink: 1,
    flexWrap: "wrap",
    textTransform: "capitalize",
  },


  buttonIcon: {
    height: 20,
    width: 35,
    resizeMode: "contain",
  },
});
