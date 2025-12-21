import React from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface ProductInfoOverlayProps {
  name: string;
  price: number;
  saleRate?: number; // %
}

const ProductInfoOverlay = ({
  name,
  price,
  saleRate = 0,
}: ProductInfoOverlayProps) => {
  const finalPrice = saleRate
    ? price * (1 - saleRate / 100)
    : price;

  return (
    <View style={styles.container}>
      <Text style={styles.name}>{name}</Text>

      {saleRate > 0 ? (
        <View style={styles.priceRow}>
          <Text style={styles.oldPrice}>
            {price.toLocaleString()}₫
          </Text>
          <Text style={styles.salePrice}>
            {finalPrice.toLocaleString()}₫
          </Text>
          <Text style={styles.saleTag}>-{saleRate}%</Text>
        </View>
      ) : (
        <Text style={styles.price}>
          {price.toLocaleString()}₫
        </Text>
      )}
    </View>
  );
};

export default ProductInfoOverlay;

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 16,
    padding: 16,
    maxWidth: 220,
  },
  name: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  price: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  oldPrice: {
    color: '#aaa',
    fontSize: 14,
    textDecorationLine: 'line-through',
    marginRight: 8,
  },
  salePrice: {
    color: '#4ade80',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 8,
  },
  saleTag: {
    color: '#fff',
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 12,
  },
});
