import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ConfirmBooking = () => {
  const navigation = useNavigation();

  // Get current date information
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonthIndex = today.getMonth();
  const currentYear = today.getFullYear();

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(currentMonthIndex);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedDay, setSelectedDay] = useState(currentDay);
  const [selectedDate, setSelectedDate] = useState(formatDate(currentYear, currentMonthIndex + 1, currentDay));

  // Function to format date properly (yyyy-mm-dd)
  function formatDate(year, month, day) {
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  // Generate calendar days based on selected month and year
  const generateCalendarDays = () => {
    const daysInMonth = new Date(selectedYear, selectedMonthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonthIndex, 1).getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }

    // Add the actual days of the selected month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ day: i, isCurrentMonth: true });
    }

    // Add empty placeholders to ensure 7-column layout
    while (days.length % 7 !== 0) {
      days.push({ day: null, isCurrentMonth: false });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Handle day selection
  const handleDaySelect = (day) => {
    if (day.isCurrentMonth && day.day) {
      setSelectedDay(day.day);
      setSelectedDate(formatDate(selectedYear, selectedMonthIndex + 1, day.day));
    }
  };

  // Handle month selection
  const handleMonthSelect = (monthIndex) => {
    setSelectedMonthIndex(monthIndex);

    // Reset selected day if switching to another month
    if (monthIndex !== currentMonthIndex || selectedYear !== currentYear) {
      setSelectedDay(null);
      setSelectedDate('');
    } else {
      setSelectedDay(currentDay);
      setSelectedDate(formatDate(currentYear, currentMonthIndex + 1, currentDay));
    }
  };

  const handleConfirmBooking = () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date for your booking.');
      return;
    }
    navigation.navigate('BookingDetailsForm', { selectedDate });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Feather name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.infoButton}>
          <Feather name="info" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Find Date Section */}
      <View style={styles.findDateSection}>
        <Text style={styles.findDateTitle}>Find your date</Text>
      </View>

      <View style={styles.selectDateRow}>
        <Text style={styles.selectDateText}>Select Date</Text>
      </View>

      {/* Month Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthsScrollContainer}>
        {months.map((month, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.monthButton,
              selectedMonthIndex === index && styles.selectedMonthButton,
            ]}
            onPress={() => handleMonthSelect(index)}
          >
            <Text
              style={[
                styles.monthText,
                selectedMonthIndex === index && styles.selectedMonthText, 
              ]}
            >
              {month}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Calendar */}
      <View style={styles.calendarContainer}>
        {/* Days of week */}
        <View style={styles.weekdaysRow}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <Text key={index} style={styles.weekdayText}>
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Days */}
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dayCell,
                day.day === selectedDay && day.isCurrentMonth && styles.selectedDay,
                day.day === currentDay && 
                selectedMonthIndex === currentMonthIndex && 
                selectedYear === currentYear && 
                day.isCurrentMonth && 
                styles.todayCell
              ]}
              onPress={() => handleDaySelect(day)}
              disabled={!day.isCurrentMonth || !day.day}
            >
              {day.day && (
                <Text
                  style={[
                    styles.dayText,
                    day.day === selectedDay && day.isCurrentMonth && styles.selectedDayText,
                    day.day === currentDay && 
                    selectedMonthIndex === currentMonthIndex && 
                    selectedYear === currentYear && 
                    day.isCurrentMonth && 
                    styles.todayText
                  ]}
                >
                  {day.day}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity style={styles.continueButton} onPress={handleConfirmBooking}>
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', // Changed background color to white
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
  },
  backButton: { 
    padding: 8 
  },
  infoButton: { 
    padding: 8 
  },
  findDateSection: { 
    paddingHorizontal: 20, 
    paddingBottom: 10 
  },
  findDateTitle: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#000' // Changed text color to black
  },
  routeText: { 
    fontSize: 16, 
    color: '#000', // Changed text color to black
    marginTop: 4 
  },
  selectDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  selectDateText: {
    fontSize: 16,
    color: '#000', // Changed text color to black
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  yearText: {
    fontSize: 16,
    color: '#000', // Changed text color to black
    marginRight: 5,
  },
  monthsScrollContainer: { 
    paddingHorizontal: 10, 
    paddingBottom: 0 
  },
  monthButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)', // Changed background color to black with opacity
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  selectedMonthButton: { 
    backgroundColor: '#000', // Changed background color to black
    height: 40
  },
  monthText: { 
    color: '#000', // Changed text color to black
    fontSize: 14 
  },
  selectedMonthText: { 
    color: '#fff', // Changed text color to white
    fontWeight: '500' 
  },
  calendarContainer: { 
    backgroundColor: '#f5f5f5', // Changed background color to #f5f5f5
    borderRadius: 12, 
    margin: 16, 
    padding: 10, 
    top: -20
  },
  weekdaysRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    marginBottom: 10 
  },
  weekdayText: { 
    fontSize: 14, 
    color: '#000', // Changed text color to black
    width: '14%', 
    textAlign: 'center' 
  },
  calendarGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between' 
  },
  dayCell: { 
    width: '14%', 
    aspectRatio: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginVertical: 4, 
    borderRadius: 20 
  },
  dayText: { 
    fontSize: 16, 
    color: '#000' // Changed text color to black
  },
  selectedDay: { 
    backgroundColor: '#000' // Changed background color to black
  },
  selectedDayText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  todayCell: {
    backgroundColor: 'red', // Changed background color to red for active date
    borderWidth: 1,
    borderColor: 'red', // Changed border color to red
  },
  todayText: {
    color: '#fff', // Changed text color to white for active date
    fontWeight: 'bold',
  },
  continueButton: { 
    backgroundColor: '#000', // Changed background color to black
    margin: 16, 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  continueButtonText: { 
    color: '#fff', // Changed text color to white
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});

export default ConfirmBooking;