import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';

const ConfirmBooking = () => {
  const navigation = useNavigation();
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    { id: 1, name: 'Jan' },
    { id: 2, name: 'Feb' },
    { id: 3, name: 'Mar' },
    { id: 4, name: 'Apr' },
    { id: 5, name: 'May' },
    { id: 6, name: 'Jun' },
    { id: 7, name: 'Jul' },
    { id: 8, name: 'Aug' },
    { id: 9, name: 'Sep' },
    { id: 10, name: 'Oct' },
    { id: 11, name: 'Nov' },
    { id: 12, name: 'Dec' },
  ];

  const handleMonthSelect = (month) => {
    setSelectedMonth(month);
  };

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
          <FontAwesome name="arrow-left" size={20} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle1}>Back</Text>
        </View>

        <Text style={styles.headerTitle2}>Select Your Date</Text>

        {/* Month Selection */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthSelectorContainer}
        >
          {months.map((month) => (
            <TouchableOpacity
              key={month.id}
              style={[
                styles.monthButton,
                selectedMonth === month.id && styles.selectedMonthButton,
              ]}
              onPress={() => handleMonthSelect(month.id)}
            >
              <Text
                style={[
                  styles.monthButtonText,
                  selectedMonth === month.id && styles.selectedMonthText,
                ]}
              >
                {month.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Calendar */}
        <View style={styles.calendarContainer}>
          <Calendar style={{borderRadius:25}}
            key={`${selectedMonth}-${selectedYear}`}
            current={`${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`}
            onDayPress={handleDayPress}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: 'black' },
            }}
            theme={{
              todayTextColor: '#FF5A5F',
              arrowColor: 'black',
              monthTextColor: '#000',
              textDayFontSize: 16,
              textMonthFontSize: 18,
              textDayHeaderFontSize: 14,
            }}
          />
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={() => {
            if (!selectedDate) {
              alert('Please select a date first!');
            } else {
              alert(`Booking confirmed for ${selectedDate}`);
            }
          }}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
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
    marginTop:50,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  
  backButton: {
    padding: 8,
  },

  headerTitle1: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 20,
  },

  headerTitle2: {
    color: 'black',
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 10,
    padding:8,
  },
  monthSelectorContainer: {
    alignItems:'center',
    marginVertical: 60,
    paddingHorizontal: 10,
    marginTop:20,
  },
  monthButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'black',
    marginRight: 10,
  },
  selectedMonthButton: {
    backgroundColor: 'black',
  },
  monthButtonText: {
    color: 'black',
    fontWeight: '500',
  },
  selectedMonthText: {
    color: 'white',
  },
  calendarContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 25,
    padding: 10,
    marginHorizontal: 16,
    marginTop:-20,
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: 'black',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 20,
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    
    
  },
});

export default ConfirmBooking;