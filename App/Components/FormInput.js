import { View, Text, TextInput, StyleSheet } from 'react-native';
import React from 'react';

const FormInput = ({
  label,
  error,
  value,
  onChangeText,
  autoCapitalize,
  secureTextEntry,
  placeholder,
  onBlur
}) => {
  return (
    <View style={styles.formContainer}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>{label}</Text>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : null}
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        onBlur={onBlur}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#1b1b33',
    height: 40,
    borderRadius: 8,
    fontSize: 16,
    paddingLeft: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
});

export default FormInput;