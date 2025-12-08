import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../constants";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  backgroundColor?: string;
};

const SafeContainer: React.FC<Props> = ({
  children,
  style,
  padding = 0,
  backgroundColor = colors.light,
}) => {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <View
        style={[
          styles.inner,
          { padding, backgroundColor },
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  inner: {
    flex: 1,
  },
});

export default SafeContainer;