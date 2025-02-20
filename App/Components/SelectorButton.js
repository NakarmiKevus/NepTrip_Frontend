import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import React from 'react';

const SelectorButton = ({ title, backgroundColor, textColor = '#FFFFFF', style, onPress }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.button,
        { backgroundColor },
        style
      ]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: textColor }]}>{title}</Text>
    </TouchableOpacity>
  );
};

export default SelectorButton;

const styles = StyleSheet.create({
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '500',
  },
});