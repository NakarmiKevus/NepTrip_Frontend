import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import bookingApi from '../API/bookingApi';

const ConfirmBooking = () => {
  const navigation = useNavigation();

  // States
  const [loading, setLoading] = useState(true);
  const [bookedDates, setBookedDates] = useState([]);

  // Get current date information
  const today = new Date();
  const currentDay = today.getDate();
  const currentMonthIndex = today.getMonth();
  const currentYear = today.getFullYear();

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const [selectedMonthIndex, setSelectedMonthIndex] = useState(currentMonthIndex);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  // Set selectedDay and selectedDate to null initially
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  // Function to format date properly (yyyy-mm-dd)
  function formatDate(year, month, day) {
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  }

  // Function to check if a date is in the past
  function isDateInPast(year, month, day) {
    // month is 1-based here (January = 1)
    const dateToCheck = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day for fair comparison
    return dateToCheck < today;
  }

  // Fetch all bookings to get booked dates
  useEffect(() => {
    fetchBookedDates();
  }, []);

  // Fetch booked dates from the API
  const fetchBookedDates = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getBookedDates();
      
      if (response.success) {
        setBookedDates(response.dates || []);
      } else {
        console.log('Failed to fetch booked dates:', response.message);
      }
    } catch (error) {
      console.error('Error fetching booked dates:', error);
    } finally {
      setLoading(false);
    }
  };

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
      const dateString = formatDate(selectedYear, selectedMonthIndex + 1, i);
      const isBooked = bookedDates.includes(dateString);
      const isPastDate = isDateInPast(selectedYear, selectedMonthIndex + 1, i);
      
      days.push({ 
        day: i, 
        isCurrentMonth: true,
        isBooked: isBooked,
        isPastDate: isPastDate
      });
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
      // Don't allow selection of booked dates
      if (day.isBooked) {
        Alert.alert('Date Unavailable', 'This date is already booked. Please select another date.');
        return;
      }

      // Don't allow selection of past dates
      if (day.isPastDate) {
        Alert.alert('Invalid Date', 'You cannot select a date in the past. Please choose a current or future date.');
        return;
      }
      
      setSelectedDay(day.day);
      setSelectedDate(formatDate(selectedYear, selectedMonthIndex + 1, day.day));
    }
  };

  // Handle month selection
  const handleMonthSelect = (monthIndex) => {
    setSelectedMonthIndex(monthIndex);
    // Reset selected day when month changes
    setSelectedDay(null);
    setSelectedDate('');
  };

  // Handle year selection
  const changeYear = (increment) => {
    setSelectedYear(prevYear => prevYear + increment);
    // Reset selected day when year changes
    setSelectedDay(null);
    setSelectedDate('');
  };

  const handleConfirmBooking = () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date for your booking.');
      return;
    }
    navigation.navigate('BookingDetailsForm', { selectedDate });
  };

  // Check if the month is in the past
  const isMonthInPast = (monthIndex) => {
    if (selectedYear < currentYear) return true;
    if (selectedYear > currentYear) return false;
    return monthIndex < currentMonthIndex;
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
        {selectedDate ? (
          <Text style={styles.selectedDateText}>Selected: {selectedDate}</Text>
        ) : (
          <Text style={styles.noDateText}>No date selected</Text>
        )}
      </View>

      {/* Year Selector */}
      <View style={styles.yearSelector}>
        <TouchableOpacity 
          onPress={() => changeYear(-1)}
          style={styles.yearButton}
          disabled={selectedYear <= currentYear && selectedMonthIndex <= currentMonthIndex}
        >
          <Feather name="chevron-left" size={20} color="#000" />
        </TouchableOpacity>
        <Text style={styles.yearText}>{selectedYear}</Text>
        <TouchableOpacity 
          onPress={() => changeYear(1)}
          style={styles.yearButton}
        >
          <Feather name="chevron-right" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Month Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthsScrollContainer}>
        {months.map((month, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.monthButton,
              selectedMonthIndex === index && styles.selectedMonthButton,
              isMonthInPast(index) && styles.pastMonthButton
            ]}
            onPress={() => handleMonthSelect(index)}
            disabled={isMonthInPast(index)}
          >
            <Text
              style={[
                styles.monthText,
                selectedMonthIndex === index && styles.selectedMonthText,
                isMonthInPast(index) && styles.pastMonthText
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2196F3" />
            <Text style={styles.loadingText}>Loading calendar...</Text>
          </View>
        ) : (
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
                  styles.todayCell,
                  day.isBooked && day.isCurrentMonth && styles.bookedDay,
                  day.isPastDate && day.isCurrentMonth && styles.pastDay
                ]}
                onPress={() => handleDaySelect(day)}
                disabled={!day.isCurrentMonth || !day.day || day.isBooked || day.isPastDate}
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
                      styles.todayText,
                      day.isBooked && styles.bookedDayText,
                      day.isPastDate && styles.pastDayText
                    ]}
                  >
                    {day.day}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {/* Date legend */}
        <View style={styles.legendContainer}>
          <View style={styles.legendItem}>
            <View style={styles.legendDot} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.todayDot]} />
            <Text style={styles.legendText}>Today</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.bookedDot]} />
            <Text style={styles.legendText}>Booked</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, styles.pastDot]} />
            <Text style={styles.legendText}>Past</Text>
          </View>
        </View>
      </View>

      {/* Continue Button */}
      <TouchableOpacity 
        style={[styles.continueButton, !selectedDate && styles.disabledButton]} 
        onPress={handleConfirmBooking}
        disabled={!selectedDate}
      >
        <Text style={styles.continueButtonText}>Continue</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    color: '#000'
  },
  routeText: { 
    fontSize: 16, 
    color: '#000',
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
    color: '#000',
  },
  selectedDateText: {
    fontSize: 14,
    color: '#000',
    fontWeight: 'bold',
  },
  noDateText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 5,
  },
  yearText: {
    fontSize: 16,
    color: '#000',
    marginHorizontal: 15,
    fontWeight: 'bold',
  },
  yearButton: {
    padding: 5,
  },
  monthsScrollContainer: { 
    paddingHorizontal: 10, 
    paddingBottom: 0,
    paddingTop: 5,
  },
  monthButton: {
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
  },
  selectedMonthButton: { 
    backgroundColor: '#000',
    height: 40
  },
  pastMonthButton: {
    backgroundColor: '#e0e0e0',
    opacity: 0.7,
  },
  monthText: { 
    color: '#000',
    fontSize: 14 
  },
  selectedMonthText: { 
    color: '#fff',
    fontWeight: '500' 
  },
  pastMonthText: {
    color: '#999',
  },
  calendarContainer: { 
    backgroundColor: '#f5f5f5',
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
    color: '#000',
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
    color: '#000'
  },
  selectedDay: { 
    backgroundColor: '#000'
  },
  selectedDayText: { 
    color: '#fff', 
    fontWeight: 'bold' 
  },
  todayCell: {
    backgroundColor: '#2196F3', // Blue for today
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  todayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  bookedDay: {
    backgroundColor: '#F44336', // Red for booked dates
    borderWidth: 1,
    borderColor: '#F44336',
  },
  bookedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pastDay: {
    backgroundColor: '#e0e0e0', // Gray for past dates
    opacity: 0.7,
  },
  pastDayText: {
    color: '#999',
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 5,
    marginBottom: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 5,
  },
  todayDot: {
    backgroundColor: '#2196F3', // Blue for today
    borderColor: '#2196F3',
  },
  bookedDot: {
    backgroundColor: '#F44336', // Red for booked
    borderColor: '#F44336',
  },
  selectedDot: {
    backgroundColor: '#000', // Black for selected
    borderColor: '#000',
  },
  pastDot: {
    backgroundColor: '#e0e0e0', // Gray for past dates
    borderColor: '#ccc',
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
  loadingContainer: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  continueButton: { 
    backgroundColor: '#000',
    margin: 16, 
    padding: 16, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  disabledButton: {
    backgroundColor: '#999',  // Grayed out when disabled
  },
  continueButtonText: { 
    color: '#fff',
    fontSize: 16, 
    fontWeight: 'bold' 
  },
});

export default ConfirmBooking;