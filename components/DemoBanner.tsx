import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DemoBanner() {
  return (
    <View style={styles.banner}>
      <Text style={styles.text}>Demo Mode</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'center',
  },
  text: {
    color: '#000',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
