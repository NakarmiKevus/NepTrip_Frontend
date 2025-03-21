import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';

const ConfirmBooking = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState('');
  const today = new Date().toISOString().split('T')[0];

  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
  };

  const handleConfirmBooking = () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date for your booking.');
      return;
    }

    // Navigate to booking details form with selected date
    navigation.navigate('BookingDetailsForm', { selectedDate });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Booking Date</Text>
        <View style={{ width: 24 }} /> {/* Empty view for balanced header */}
      </View>

      <View style={styles.calendarContainer}>
        <Text style={styles.instructionText}>
          Please select a date for your trekking experience:
        </Text>
        
        <Calendar
          minDate={today}
          onDayPress={handleDateSelect}
          markedDates={{
            [selectedDate]: { selected: true, selectedColor: 'black' },
          }}
          theme={{
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#b6c1cd',
            selectedDayBackgroundColor: '#00adf5',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#00adf5',
            dayTextColor: '#2d4150',
            arrowColor: 'black',
          }}
        />

        {selectedDate ? (
          <View style={styles.selectedDateContainer}>
            <Feather name="calendar" size={20} color="#666" />
            <Text style={styles.selectedDateText}>
              Selected Date: {selectedDate}
            </Text>
          </View>
        ) : null}
      </View>

      <TouchableOpacity
        style={[
          styles.confirmButton,
          !selectedDate && styles.disabledButton,
        ]}
        onPress={handleConfirmBooking}
        disabled={!selectedDate}
      >
        <Text style={styles.confirmButtonText}>Continue to Booking Details</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  calendarContainer: {
    padding: 16,
    backgroundColor: '#ffffff',
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  instructionText: {
    fontSize: 16,
    marginBottom: 16,
    color: '#666',
  },
  selectedDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  selectedDateText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  confirmButton: {
    backgroundColor: 'black',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ConfirmBooking;