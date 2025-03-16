import React, { useState } from 'react';
import { View, Text, Button, Alert, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

import { useNavigation } from '@react-navigation/native';

const ConfirmBooking = () => {
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const navigation = useNavigation();

  const handleConfirm = () => {
    if (!date) {
      Alert.alert('Error', 'Please select a date.');
      return;
    }
    navigation.navigate('BookingDetailsForm', { selectedDate: date.toISOString().split('T')[0] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Date for Your Guide Booking</Text>
      <Button title="Pick a Date" onPress={() => setShowPicker(true)} />
      
      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="calendar"
          onChange={(event, selectedDate) => {
            setShowPicker(false);
            if (selectedDate) setDate(selectedDate);
          }}
        />
      )}

      <Text style={styles.dateText}>Selected Date: {date.toISOString().split('T')[0]}</Text>
      <Button title="Continue" onPress={handleConfirm} />
    </View>
  );
};

export default ConfirmBooking;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    marginBottom: 12,
  },
  dateText: {
    marginVertical: 10,
    fontSize: 16,
  },
});
