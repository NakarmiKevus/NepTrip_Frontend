import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

const MapScreen = () => {
  const [region, setRegion] = useState(null);
  const [destination, setDestination] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    })();
  }, []);

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <GooglePlacesAutocomplete
        placeholder="Search a place"
        fetchDetails={true}
        onPress={(data, details = null) => {
          const lat = details.geometry.location.lat;
          const lng = details.geometry.location.lng;

          setDestination({ latitude: lat, longitude: lng });

          mapRef.current.animateToRegion({
            latitude: lat,
            longitude: lng,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        }}
        query={{
          key: 'YOUR_GOOGLE_API_KEY', 
          language: 'en',
        }}
        styles={{
          container: {
            position: 'absolute',
            top: 10,
            width: '90%',
            alignSelf: 'center',
            zIndex: 1,
          },
          textInput: {
            height: 45,
            borderRadius: 5,
            paddingHorizontal: 10,
            fontSize: 16,
            backgroundColor: '#fff',
          },
        }}
      />

      {/* Map */}
      {region && (
        <MapView
          ref={mapRef}
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* Marker for Searched Place */}
          {destination && (
            <Marker coordinate={destination} title="Destination" />
          )}
        </MapView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
});

export default MapScreen;
