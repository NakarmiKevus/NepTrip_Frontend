import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import React from 'react';

const FormSubmitButton = ({ title, submitting, onPress }) => {
  const backgroundColor = submitting? 'rgba(0,0,0,0.4)': 'black'
  return (
    <TouchableOpacity onPress={!submitting ? onPress: null} style={[styles.container,{backgroundColor}]} >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
};

export default FormSubmitButton;

const styles = StyleSheet.create({
  container: {
    height: 45,
    backgroundColor: 'black',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  text: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },
});
