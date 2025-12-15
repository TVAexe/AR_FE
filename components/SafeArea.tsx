import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import {
  SafeAreaView,
  Edge,
} from "react-native-safe-area-context";
import { colors } from "../constants";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  /**
   * Padding ngang cho nội dung (trái/phải)
   */
  horizontalPadding?: number;
  /**
   * Padding dọc thêm nếu cần (trên/dưới).
   * Mặc định = 0 để header/footer sát safe-area.
   */
  verticalPadding?: number;
  backgroundColor?: string;
  edges?: Edge[];
};

const SafeContainer: React.FC<Props> = ({
  children,
  style,
  horizontalPadding = 16,
  verticalPadding = 0,
  backgroundColor = colors.light,
  edges = ["top", "bottom", "left", "right"],
}) => {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={edges}>
      <View
        style={[
          styles.inner,
          {
            paddingHorizontal: horizontalPadding,
            paddingVertical: verticalPadding,
          },
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
