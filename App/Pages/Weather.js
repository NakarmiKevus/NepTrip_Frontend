import { StyleSheet, Text, TouchableOpacity, View, TouchableWithoutFeedback, Keyboard, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, TextInput } from 'react-native-gesture-handler';
import { CalendarDaysIcon, MagnifyingGlassCircleIcon } from 'react-native-heroicons/outline';
import { MapPinIcon } from 'react-native-heroicons/solid';
import { debounce } from 'lodash';
import { fetchLocations, fetchWeatherForecast } from '../API/weather';
import { weatherImages } from '../..';
import { Feather } from '@expo/vector-icons';
import { getData, storeData } from '../utils/asyncStorage';
import * as Progress from 'react-native-progress';

const Weather = () => {
  const [showSearch, toggleSearch] = useState(false);
  const [locations, setLocations] = useState([]);
  const [weather, setWeather] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [noLocationFound, setNoLocationFound] = useState(false); 

  const handleLocation = (loc) => {
    toggleSearch(false);
    Keyboard.dismiss();
    setLocations([]);
    setLoading(true);
    setError(null);
    setNoLocationFound(false); 

    fetchWeatherForecast({
      cityName: loc.name,
      days: '7',
    })
      .then((data) => {
        setWeather(data);
        setLoading(false);
        storeData('city', loc.name);
      })
      .catch((error) => {
        console.error('Error fetching weather forecast:', error);
        setError('Failed to load weather data');
        setLoading(false);
      });
  };

  const handleSearch = (value) => {
    if (value.length > 2) {
      setLoading(true);
      setError(null);
      setNoLocationFound(false); 

      fetchLocations({ cityName: value })
        .then((data) => {
          if (data && data.length > 0) {
            setLocations(data);
          } else {
            setNoLocationFound(true); 
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching locations:', error);
          setError('Failed to find locations');
          setLoading(false);
          setLocations([]);
        });
    }
  };

  useEffect(() => {
    fetchMyWeatherData();
  }, []);

  const fetchMyWeatherData = async () => {
    setLoading(true);
    setError(null);

    try {
      let myCity = await getData('city');
      let cityName = myCity || 'Kathmandu';

      const data = await fetchWeatherForecast({
        cityName,
        days: '7',
      });

      setWeather(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Failed to load weather data');
      setLoading(false);
    }
  };

  const handleTextDebounce = useCallback(debounce(handleSearch, 1200), []);

  const { current, location, forecast } = weather || {};

  const getWeatherImage = (condition) => {
    if (!condition) return require('../../assets/images/partlycloudy.png');

    try {
      const image = weatherImages[condition.text];
      return image ? image : require('../../assets/images/partlycloudy.png');
    } catch (e) {
      console.error('Error getting weather image:', e);
      return require('../../assets/images/partlycloudy.png');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'android' ? 'padding' : 'height'}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={() => toggleSearch(false)}>
        <View style={styles.container}>
          <StatusBar style="light" />
          {loading ? (
            <View style={styles.loadingContainer}>
              <Progress.CircleSnail thickness={10} size={140} color="#0bb3b2" />
            </View>
          ) : (
            <SafeAreaView style={styles.safeArea}>
              {/* Search Box */}
              <View style={styles.searchBox}>
                <View style={styles.searchContainer}>
                  <Feather name="search" size={20} color="white" style={styles.button} />
                  <TextInput
                    onChangeText={handleTextDebounce}
                    placeholder="Search city"
                    placeholderTextColor={'grey'}
                    style={styles.input}
                    onFocus={() => toggleSearch(true)}
                  />
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
                          <Text style={styles.locationText}>
                            {loc?.name}, {loc?.country}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {noLocationFound && showSearch && (
                  <View style={styles.noLocationContainer}>
                    <Text style={styles.noLocationText}>No location found</Text>
                  </View>
                )}
              </View>

              {noLocationFound ? (
                <View style={styles.noLocationContainer}>
                  <Text style={styles.noLocationText}>No location found</Text>
                </View>
              ) : error ? (
                <View style={styles.errorContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                  <TouchableOpacity style={styles.retryButton} onPress={fetchMyWeatherData}>
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={showSearch ? styles.contentContainerSearch : styles.contentContainer}
                >
                  {/* Location */}
                  <View style={styles.weatherInfo}>
                    <Text style={styles.locationTextBig}>
                      {location?.name || 'Loading...'},
                      <Text style={styles.locationSubText}>
                        {' ' + (location?.country || '')}
                      </Text>
                    </Text>

                    {/* Weather display */}
                    <View style={styles.centeredWeatherContainer}>
                      <Image
                        source={getWeatherImage(current?.condition)}
                        style={styles.weatherImage1}
                      />

                      <View style={styles.centeredWeatherDetails}>
                        <Text style={styles.temperatureText}>
                          {current?.temp_c ?? 23}&#176;
                        </Text>
                        <Text style={styles.weatherConditionText}>
                          {current?.condition?.text ?? 'Partly Cloudy'}
                        </Text>

                        <View style={styles.weatherDetails}>
                          <View style={styles.detailItem}>
                            <Image
                              source={require('../../assets/images/wind.png')}
                              style={styles.iconSmall}
                            />
                            <Text style={styles.detailText}>
                              {current?.wind_kph ?? 9} km/h
                            </Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Image
                              source={require('../../assets/images/drop.png')}
                              style={styles.iconSmall}
                            />
                            <Text style={styles.detailText}>
                              {current?.humidity ?? 43}%
                            </Text>
                          </View>
                          <View style={styles.detailItem}>
                            <Image
                              source={require('../../assets/images/sun.png')}
                              style={styles.iconSmall}
                            />
                            <Text style={styles.detailText}>
                              {weather?.forecast?.forecastday?.[0]?.astro?.sunrise || '6:00 AM'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Forecast */}
                  <View style={styles.forecastContainer}>
                    <View style={styles.forecastHeader}>
                      <CalendarDaysIcon size={22} color="white" />
                      <Text style={styles.forecastText}>Daily Forecast</Text>
                    </View>

                    <ScrollView
                      horizontal
                      contentContainerStyle={{ paddingHorizontal: 10, flexDirection: 'row' }}
                      showsHorizontalScrollIndicator={false}
                    >
                      {weather?.forecast?.forecastday?.length > 0 ? (
                        weather.forecast.forecastday
                          .slice(1, 8) // Skip today's data and limit to the next 7 days
                          .map((item, index) => {
                            const date = new Date(item.date);
                            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });

                            return (
                              <View key={item.date || index} style={styles.forecastItem}>
                                <Image
                                  source={getWeatherImage(item?.day?.condition)}
                                  style={styles.weatherImage}
                                />
                                <Text style={styles.forecastDay} numberOfLines={1} ellipsizeMode="tail">
                                  {dayName}
                                </Text>
                                <Text style={styles.forecastTemp}>
                                  {item?.day?.avgtemp_c ? item.day.avgtemp_c.toFixed(1) : '0'}&#176;
                                </Text>
                              </View>
                            );
                          })
                      ) : (
                        <View style={styles.forecastItem}>
                          <Text style={styles.forecastDay}>No forecast data</Text>
                        </View>
                      )}
                    </ScrollView>
                  </View>
                </ScrollView>
              )}
            </SafeAreaView>
          )}
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    marginTop:50,
  },
  contentContainerSearch: {
    flexGrow: 1,
    paddingBottom: 2,
    paddingTop: 1, 
  },
  searchBox: {
    position: 'absolute',
    zIndex: 50,
    marginHorizontal: 16,
    marginTop: 10,
    width: '92%',
    alignSelf: 'center',
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    maxHeight: 250, 
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
  noLocationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noLocationText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  weatherInfo: {
    marginTop: 30, // Increased to make room for search box
    marginHorizontal: 16,
    justifyContent: 'flex-start',
    zIndex: 1,
  },
  locationTextBig: {
    color: 'white',
    fontSize: 28, // Slightly smaller to fit better
    textAlign: 'center',
    marginBottom: 20,
  },
  locationSubText: {
    fontSize: 16,
    color: 'gray',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 18,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  retryText: {
    color: 'white',
    fontSize: 16,
  },
  centeredWeatherContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:20,
  },
  centeredWeatherDetails: {
    alignItems: 'center',
    marginTop: 20,
  },
  weatherImage1: {
    width: 150, // Slightly smaller
    height: 150, // Slightly smaller
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
    textAlign: 'center',
    marginTop: 20,
  },
  weatherDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 40,
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
    marginTop: 50,
    marginBottom: 20,
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
    marginVertical: 8,
    textAlign: 'center',
    width: 75, // Ensure a fixed width
  },
  forecastTemp: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});