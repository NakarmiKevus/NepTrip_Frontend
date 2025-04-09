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
  const [loading, setLoading] = useState(true);
  const [bookedDates, setBookedDates] = useState([]);

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonthIndex = today.getMonth();
  const currentYear = today.getFullYear();

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(currentMonthIndex);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    fetchBookedDates();
  }, []);

  const formatDate = (year, month, day) => {
    return `${year}-${(month).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  };

  const isDateInPast = (year, month, day) => {
    const dateToCheck = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dateToCheck < today;
  };

  const fetchBookedDates = async () => {
    try {
      setLoading(true);
      const response = await bookingApi.getBookedDates();
      if (response.success) {
        setBookedDates(response.dates || []);
      }
    } catch (error) {
      console.error('Error fetching booked dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateCalendarDays = () => {
    const daysInMonth = new Date(selectedYear, selectedMonthIndex + 1, 0).getDate();
    const firstDayOfMonth = new Date(selectedYear, selectedMonthIndex, 1).getDay();

    const days = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, isCurrentMonth: false });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const dateString = formatDate(selectedYear, selectedMonthIndex + 1, i);
      const isBooked = bookedDates.includes(dateString);
      const isPastDate = isDateInPast(selectedYear, selectedMonthIndex + 1, i);
      days.push({ day: i, isCurrentMonth: true, isBooked, isPastDate });
    }

    while (days.length % 7 !== 0) {
      days.push({ day: null, isCurrentMonth: false });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  const handleDaySelect = (day) => {
    if (day.isBooked) {
      Alert.alert('Unavailable', 'This date is already booked.');
      return;
    }
    if (day.isPastDate) {
      Alert.alert('Invalid', 'Please choose a future date.');
      return;
    }
    setSelectedDay(day.day);
    setSelectedDate(formatDate(selectedYear, selectedMonthIndex + 1, day.day));
  };

  const handleMonthSelect = (index) => {
    setSelectedMonthIndex(index);
    setSelectedDay(null);
    setSelectedDate('');
  };

  const changeYear = (step) => {
    setSelectedYear(prev => prev + step);
    setSelectedDay(null);
    setSelectedDate('');
  };

  const isMonthInPast = (monthIndex) => {
    if (selectedYear < currentYear) return true;
    if (selectedYear > currentYear) return false;
    return monthIndex < currentMonthIndex;
  };

  const handleConfirmBooking = () => {
    if (!selectedDate) {
      Alert.alert('Error', 'Please select a date.');
      return;
    }
    navigation.navigate('BookingDetailsForm', { selectedDate });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Feather name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity>
            <Feather name="info" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title}>Find your date</Text>

        {/* Selected Date Display */}
        <View style={styles.dateRow}>
          <Text style={styles.label}>Select Date</Text>
          <Text style={selectedDate ? styles.date : styles.datePlaceholder}>
            {selectedDate ? `Selected: ${selectedDate}` : 'No date selected'}
          </Text>
        </View>

        {/* Year Selector */}
        <View style={styles.yearSelector}>
          <TouchableOpacity onPress={() => changeYear(-1)}>
            <Feather name="chevron-left" size={20} />
          </TouchableOpacity>
          <Text style={styles.yearText}>{selectedYear}</Text>
          <TouchableOpacity onPress={() => changeYear(1)}>
            <Feather name="chevron-right" size={20} />
          </TouchableOpacity>
        </View>

        {/* Month Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.monthSelector}>
          {months.map((month, index) => (
            <TouchableOpacity
              key={month}
              onPress={() => handleMonthSelect(index)}
              disabled={isMonthInPast(index)}
              style={[
                styles.monthButton,
                selectedMonthIndex === index && styles.activeMonth,
                isMonthInPast(index) && styles.pastMonth
              ]}
            >
              <Text style={[
                styles.monthText,
                selectedMonthIndex === index && styles.activeMonthText,
                isMonthInPast(index) && styles.pastMonthText
              ]}>
                {month}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Calendar Grid */}
        <View style={styles.calendar}>
          {/* Week Days */}
          <View style={styles.weekRow}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
              <Text key={i} style={styles.weekday}>{d}</Text>
            ))}
          </View>

          {/* Calendar Days */}
          <View style={styles.daysGrid}>
            {loading ? (
              <ActivityIndicator size="large" />
            ) : (
              calendarDays.map((day, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.day,
                    day.day === selectedDay && styles.selectedDay,
                    day.day === currentDay &&
                    selectedMonthIndex === currentMonthIndex &&
                    selectedYear === currentYear &&
                    styles.today,
                    day.isBooked && styles.bookedDay,
                    day.isPastDate && styles.pastDay
                  ]}
                  onPress={() => handleDaySelect(day)}
                  disabled={!day.day || day.isBooked || day.isPastDate}
                >
                  <Text style={[
                    styles.dayText,
                    day.day === selectedDay && styles.selectedDayText,
                    day.isBooked && styles.bookedText,
                    day.isPastDate && styles.pastText
                  ]}>
                    {day.day || ''}
                  </Text>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Legend */}
          <View style={styles.legend}>
            <Text style={styles.legendItem}>⬤ Available</Text>
            <Text style={[styles.legendItem, { color: '#2196F3' }]}>⬤ Today</Text>
            <Text style={[styles.legendItem, { color: '#F44336' }]}>⬤ Booked</Text>
            <Text style={[styles.legendItem, { color: '#999' }]}>⬤ Past</Text>
          </View>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[styles.continueBtn, !selectedDate && styles.disabledBtn]}
          onPress={handleConfirmBooking}
          disabled={!selectedDate}
        >
          <Text style={styles.continueText}>Continue</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
  },
  date: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  datePlaceholder: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  yearSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  yearText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 10,
  },
  monthSelector: {
    paddingVertical: 10,
  },
  monthButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
  },
  activeMonth: {
    backgroundColor: '#000',
  },
  pastMonth: {
    opacity: 0.6,
  },
  monthText: {
    fontSize: 14,
  },
  activeMonthText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pastMonthText: {
    color: '#999',
  },
  calendar: {
    marginTop: 10,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
  },
  weekday: {
    width: 32,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  day: {
    width: '13%',
    aspectRatio: 1,
    marginVertical: 4,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
  },
  selectedDay: {
    backgroundColor: '#000',
  },
  selectedDayText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  today: {
    backgroundColor: '#2196F3',
  },
  bookedDay: {
    backgroundColor: '#F44336',
  },
  bookedText: {
    color: '#fff',
  },
  pastDay: {
    backgroundColor: '#eee',
  },
  pastText: {
    color: '#999',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    borderTopWidth: 1,
    borderColor: '#ccc',
    paddingTop: 10,
  },
  legendItem: {
    fontSize: 12,
    color: '#666',
  },
  continueBtn: {
    backgroundColor: '#000',
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledBtn: {
    backgroundColor: '#999',
  },
  continueText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ConfirmBooking;
