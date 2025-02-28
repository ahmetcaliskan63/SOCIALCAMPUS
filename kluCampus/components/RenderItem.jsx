import { Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import React from 'react';

const RenderItem = ({ item }) => {
  const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = useWindowDimensions();

  return (
    <View
      style={[
        styles.itemContainer,
        { width: SCREEN_WIDTH, height: SCREEN_HEIGHT, backgroundColor: item.backgroundColor },
      ]}
    >
      <Image source={item.image} style={styles.image} />
      <Text style={[styles.itemTitle, { color: item.textColor }]}>{item.title}</Text>
      <Text style={[styles.itemText, { color: item.textColor }]}>
        {item.text}
      </Text>
    </View>
  );
};

export default RenderItem;

const styles = StyleSheet.create({
  itemContainer: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 80,
  },
  image: {
    width: 150,
    height: 150,
    marginTop: 80,
  },
  itemTitle: {
    fontSize: 30,
    marginTop: 60,
    textAlign: 'center', // Ortaladı
    maxWidth: '80%', // Çok uzun yazılarda ekranın %80'ini kaplamasını sağladı
    lineHeight: 35, // Satır yüksekliği ayarlandı
  },
  itemText: {
    marginTop: 60,
    textAlign: 'center',
    fontSize: 17,
    fontWeight: 'bold',
    marginHorizontal: 20,
    lineHeight: 28,
    fontFamily: 'serif',
  },
});
