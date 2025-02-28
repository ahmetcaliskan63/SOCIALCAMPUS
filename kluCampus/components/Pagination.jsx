import React from 'react';
import { View, StyleSheet } from 'react-native';

const Pagination = ({ data, currentIndex }) => {
  return (
    <View style={styles.pagination}>
      {data.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            currentIndex === index ? styles.activeDot : styles.inactiveDot,
          ]}
        />
      ))}
    </View>
  );
};

export default Pagination;

const styles = StyleSheet.create({
  pagination: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#007BFF',
    width: 20,
  },
  inactiveDot: {
    backgroundColor: '#d3d3d3',
  },
});
