import { Image } from "expo-image";
import React, { useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { colors } from "../../constants";

const { width } = Dimensions.get("window");
const SLIDER_WIDTH = width;
const ITEM_WIDTH = width - 20;

const PromotionSlider = ({ slides }) => {
  const [activeSlide, setActiveSlide] = useState(0);

  return (
    <View>
      <Carousel
        width={SLIDER_WIDTH}
        height={140}
        data={slides}
        autoPlay
        autoPlayInterval={6000}
        loop
        scrollAnimationDuration={800}
        onSnapToItem={(index) => setActiveSlide(index)}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            {/* <Image source={{ uri: item }} style={styles.image} /> */}
            <Image source={item} style={styles.image} contentFit="cover" />
          </View>
        )}
      />

      <View style={styles.pagination}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={i === activeSlide ? styles.activeDot : styles.inactiveDot}
          />
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  slide: {
    width: ITEM_WIDTH,
    height: 140,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: colors.light,
    alignSelf: "center",
  },

  image: {
    width: "100%",
    height: "100%",
  },

  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    paddingTop: 8,
  },

  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
    backgroundColor: colors.primary,
  },

  inactiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    backgroundColor: colors.muted,
    opacity: 0.4,
  },
});

export default PromotionSlider;
