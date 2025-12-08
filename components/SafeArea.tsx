import React from "react";
import { StyleSheet, View, ViewStyle, Dimensions, Platform } from "react-native";
import { SafeAreaView, useSafeAreaInsets, Edge } from "react-native-safe-area-context";
import { colors } from "../constants";

type Props = {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
  backgroundColor?: string;
  edges?: Edge[];
  topOffset?: number; // Thêm prop để điều chỉnh top
};

const SafeContainer: React.FC<Props> = ({
  children,
  style,
  padding = 0,
  backgroundColor = colors.light,
  edges = ['top', 'bottom', 'left', 'right'],
  topOffset = -30, // Default không offset
}) => {
  const insets = useSafeAreaInsets();

  const getPaddingForEdge = (edge: 'top' | 'bottom' | 'left' | 'right') => {
    const inset = insets[edge];
    const shouldApplyInset = edges.includes(edge);
    
    if (!shouldApplyInset) return 0;
    
    if (edge === 'top' && inset > 0) {
      return Math.max(inset + topOffset, 0); // Áp dụng topOffset
    }
    
    return inset > 0 ? inset : 0;
  };

  return (
    <SafeAreaView 
      style={[styles.safeArea, { backgroundColor }]}
      edges={edges}
    >
      <View
        style={[
          styles.inner,
          {
            backgroundColor,
            paddingTop: getPaddingForEdge('top') + padding,
            paddingBottom: getPaddingForEdge('bottom') + padding,
            paddingLeft: getPaddingForEdge('left') + padding,
            paddingRight: getPaddingForEdge('right') + padding,
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

