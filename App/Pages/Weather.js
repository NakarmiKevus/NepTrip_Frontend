import { StyleSheet, Text, TouchableOpacity, View, TouchableWithoutFeedback, Keyboard, Image } from 'react-native';
import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { CalendarDaysIcon, MagnifyingGlassCircleIcon } from 'react-native-heroicons/outline';
import { MapPinIcon } from 'react-native-heroicons/solid';

const Weather = () => {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState(["Kathmandu, Nepal", "Pokhara, Nepal", "Lalitpur, Nepal"]);

  const handleLocation = (loc) => {
    console.log('Selected location:', loc);
    toggleSearch(false);
    Keyboard.dismiss();
  };

  const handleDismiss = () => {
    toggleSearch(false);
    Keyboard.dismiss();
  };

  return (
    <TouchableWithoutFeedback onPress={handleDismiss}>
      <View style={styles.container}>
        <StatusBar style="light" />

        <SafeAreaView style={styles.safeArea}>
          <View style={styles.searchBox}>
            <View style={styles.searchContainer}>
              <TextInput
                placeholder='Search city'
                placeholderTextColor={'grey'}
                style={styles.input}
                onFocus={() => toggleSearch(true)}
              />
              <TouchableOpacity style={styles.button}>
                <MagnifyingGlassCircleIcon size={25} color="white" />
              </TouchableOpacity>
            </View>

            {locations.length > 0 && showSearch && (
              <View style={styles.dropdown}>
                {locations.map((loc, index) => {
                  const showBorder = index + 1 !== locations.length;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleLocation(loc)}
                      style={[styles.locationItem, showBorder && styles.borderBottom]}
                    >
                      <MapPinIcon size={20} color="grey" />
                      <Text style={styles.locationText}>{loc}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          <View style={styles.weatherInfo}> 
            <Text style={styles.locationTextBig}>
                Kathmandu,
                <Text style={styles.locationSubText}>
                    Nepal
                </Text>
            </Text>
            
            {/* Centered weather display */}
            <View style={styles.centeredWeatherContainer}>
              <Image 
                source={require('../../assets/images/partlycloudy.png')} 
                style={styles.weatherImage1} 
              />
              
              <View style={styles.centeredWeatherDetails}>
                <Text style={styles.temperatureText}>23&#176;</Text>
                <Text style={styles.weatherConditionText}>Partly Cloudy</Text>
                
                <View style={styles.weatherDetails}>
                  <View style={styles.detailItem}>
                    <Image 
                      source={require('../../assets/images/wind.png')} 
                      style={styles.iconSmall} 
                    />
                    <Text style={styles.detailText}>22 km/h</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Image 
                      source={require('../../assets/images/drop.png')} 
                      style={styles.iconSmall} 
                    />
                    <Text style={styles.detailText}>25%</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Image 
                      source={require('../../assets/images/sun.png')} 
                      style={styles.iconSmall} 
                    />
                    <Text style={styles.detailText}>6:00 AM</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.forecastContainer}>
            <View style={styles.forecastHeader}>
              <CalendarDaysIcon size={22} color="white" />
              <Text style={styles.forecastText}>Daily Forecast</Text>
            </View>

            <ScrollView horizontal contentContainerStyle={{ paddingHorizontal: 0.5 }} showsHorizontalScrollIndicator={false}>
              <View style={styles.forecastItem}>
                <Image source={require('../../assets/images/heavyrain.png')} style={styles.weatherImage} />
                <Text style={styles.forecastDay}>Monday</Text>
                <Text style={styles.forecastTemp}>10&#176;</Text>
              </View>
              <View style={styles.forecastItem}>
                <Image source={require('../../assets/images/heavyrain.png')} style={styles.weatherImage} />
                <Text style={styles.forecastDay}>Tuesday</Text>
                <Text style={styles.forecastTemp}>10&#176;</Text>
              </View>
              <View style={styles.forecastItem}>
                <Image source={require('../../assets/images/heavyrain.png')} style={styles.weatherImage} />
                <Text style={styles.forecastDay}>Wednesday</Text>
                <Text style={styles.forecastTemp}>10&#176;</Text>
              </View>
              <View style={styles.forecastItem}>
                <Image source={require('../../assets/images/heavyrain.png')} style={styles.weatherImage} />
                <Text style={styles.forecastDay}>Thursday</Text>
                <Text style={styles.forecastTemp}>10&#176;</Text>
              </View>
              <View style={styles.forecastItem}>
                <Image source={require('../../assets/images/heavyrain.png')} style={styles.weatherImage} />
                <Text style={styles.forecastDay}>Friday</Text>
                <Text style={styles.forecastTemp}>10&#176;</Text>
              </View>
              <View style={styles.forecastItem}>
                <Image source={require('../../assets/images/heavyrain.png')} style={styles.weatherImage} />
                <Text style={styles.forecastDay}>Saturday</Text>
                <Text style={styles.forecastTemp}>10&#176;</Text>
              </View>
              <View style={styles.forecastItem}>
                <Image source={require('../../assets/images/heavyrain.png')} style={styles.weatherImage} />
                <Text style={styles.forecastDay}>Sunday</Text>
                <Text style={styles.forecastTemp}>10&#176;</Text>
              </View>
            </ScrollView>
          </View>
        </SafeAreaView>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Weather;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  safeArea: {
    flex: 1,
  },
  searchBox: {
    position: 'relative',
    zIndex: 50,
    marginHorizontal: 16,
    marginTop: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: 'white',
  },
  button: {
    padding: 8,
  },
  dropdown: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 20,
    marginTop: 10,
    paddingVertical: 8,
    position: 'absolute',
    top: 50,
    zIndex: 99,
  },
  locationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  borderBottom: {
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
  },
  locationText: {
    marginLeft: 8,
    color: 'black',
    fontSize: 16,
  },
  weatherInfo: {
    flex: 1,
    marginTop: 5,
    marginHorizontal: 16,
    justifyContent: 'flex-start',
    zIndex: 1,
  },
  locationTextBig: {
    color: 'white',
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 20,
  },
  locationSubText: {
    fontSize: 18,
    color: 'gray',
  },

  centeredWeatherContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centeredWeatherDetails: {
    alignItems: 'center',
    marginTop: 10,
  },
  weatherImage1: {
    width: 170,
    height: 170,
  },
  weatherImage: {
    width: 30,
    height: 30,
  },
  iconSmall: {
    width: 24,
    height: 24,
    marginBottom: 5,
  },
  temperatureText: {
    fontSize: 60,
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  weatherConditionText: {
    fontSize: 18,
    color: 'white',
    // marginTop: 5,
    // marginBottom: 5,
    textAlign: 'center',
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
    marginTop: 30,
  },
  detailItem: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  detailText: {
    color: 'white',
    fontSize: 16,
  },
  forecastContainer: {
    marginBottom: 12,
    marginHorizontal: 16,
  },
  forecastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  forecastText: {
    color: 'white',
    fontSize: 18,
    marginLeft: 8,
  },
  forecastItem: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
  },
  forecastDay: {
    color: 'white',
    fontSize: 14,
    marginBottom: 8,
  },
  forecastTemp: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});