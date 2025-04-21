import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

// Pages & Components
import AppForm from './App/Components/AppForm';
import ImageUploader from './App/Components/ImageUploader';
import LoginForm from './App/Pages/LoginForm';
import SignupForm from './App/Pages/SignupForm';
import Dashboard from './App/Pages/Dashboard';
import TrekkingDetails from './App/Pages/TrekkingDetails';
import GuideScreen from './App/Pages/Guide';
import EditProfile from './App/Pages/EditProfile';
import Weather from './App/Pages/Weather';
import ConfirmBooking from './App/Pages/ConfirmBooking';
import BookingDetailsForm from './App/Pages/BookingDetailsForm';
import BookingStatusLoader from './App/Pages/BookingStatusLoader';
import UserProfile from './App/Pages/UserProfile';
import AdminDashboard from './App/Pages/AdminDashboard';
import TrekkingForm from './App/Pages/TrekkingForm';
import EditTrekking from './App/Pages/EditTrekking';
import GuideDatabase from './App/Pages/GuideDatabase';
import UserDetails from './App/Pages/UserDetails';
import GuideDashboard from './App/Pages/GuideDashboard';
import Tours from './App/Pages/Tours';
import AddGuide from './App/Pages/AddGuide';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Profile Stack
const ProfileStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="UserProfile" component={UserProfile} />
    <Stack.Screen name="EditProfile" component={EditProfile} />
  </Stack.Navigator>
);

// Guide Stack
const GuideStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GuideMain" component={GuideScreen} />
    <Stack.Screen name="ConfirmBooking" component={ConfirmBooking} />
    <Stack.Screen name="BookingDetailsForm" component={BookingDetailsForm} />
    <Stack.Screen name="BookingStatusLoader" component={BookingStatusLoader} />
  </Stack.Navigator>
);

// Admin Stack - Fixed by ensuring clean formatting
const AdminDashboardStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AdminDashboardMain" component={AdminDashboard} />
    <Stack.Screen name="TrekkingForm" component={TrekkingForm} />
    <Stack.Screen name="EditTrekking" component={EditTrekking} />
    <Stack.Screen name="TrekkingDetails" component={TrekkingDetails} />
    <Stack.Screen name="AddGuide" component={AddGuide} />
  </Stack.Navigator>
);

// Guides Stack - Added new navigator for Guides tab
const GuidesStackNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="GuidesMain" component={GuideDatabase} />
    <Stack.Screen name="AddGuide" component={AddGuide} />
  </Stack.Navigator>
);

// User Bottom Tabs
const UserBottomTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Explore: 'compass',
          Guide: 'map',
          Navigate: 'navigation',
          Weather: 'cloud',
          Profile: 'user',
        };
        return <Feather name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: '#666',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Explore" component={Dashboard} />
    <Tab.Screen name="Guide" component={GuideStackNavigator} />
    <Tab.Screen name="Navigate" component={Dashboard} />
    <Tab.Screen name="Weather" component={Weather} />
    <Tab.Screen name="Profile" component={ProfileStackNavigator} />
  </Tab.Navigator>
);

// Guide Bottom Tabs
const GuideBottomTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Bookings: 'calendar',
          Tours: 'map-pin',
          Navigate: 'navigation',
          Weather: 'cloud',
          Profile: 'user',
        };
        return <Feather name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: '#666',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Bookings" component={GuideDashboard} />
    <Tab.Screen name="Tours" component={Tours} />
    <Tab.Screen name="Navigate" component={Weather} />
    <Tab.Screen name="Weather" component={Weather} />
    <Tab.Screen name="Profile" component={ProfileStackNavigator} />
  </Tab.Navigator>
);

// Admin Bottom Tabs
const AdminBottomTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Dashboard: 'grid',
          Users: 'users',
          Guides: 'briefcase',
          Profile: 'user',
        };
        return <Feather name={icons[route.name]} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#2196F3',
      tabBarInactiveTintColor: '#666',
      headerShown: false,
    })}
  >
    <Tab.Screen name="Dashboard" component={AdminDashboardStackNavigator} />
    <Tab.Screen name="Users" component={UserDetails} />
    <Tab.Screen name="Guides" component={GuidesStackNavigator} />
    <Tab.Screen name="Profile" component={ProfileStackNavigator} />
  </Tab.Navigator>
);

// Main Navigation Stack
const StackNavigator = ({ initialRoute }) => (
  <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
    <Stack.Screen name="AppForm" component={AppForm} />
    <Stack.Screen name="LoginForm" component={LoginForm} />
    <Stack.Screen name="SignupForm" component={SignupForm} />
    <Stack.Screen name="ImageUpload" component={ImageUploader} />
    <Stack.Screen name="Dashboard" component={UserBottomTabNavigator} />
    <Stack.Screen name="GuideDashboard" component={GuideBottomTabNavigator} />
    <Stack.Screen name="AdminDashboard" component={AdminBottomTabNavigator} />
    <Stack.Screen name="TrekkingDetails" component={TrekkingDetails} />
  </Stack.Navigator>
);

// App Component with auto-login logic
export default function App() {
  const [loading, setLoading] = useState(true);
  const [initialRoute, setInitialRoute] = useState('LoginForm');

  useEffect(() => {
    const checkUserLogin = async () => {
      const token = await AsyncStorage.getItem('token');
      const role = await AsyncStorage.getItem('userRole');

      if (token) {
        switch (role) {
          case 'admin':
            setInitialRoute('AdminDashboard');
            break;
          case 'guide':
            setInitialRoute('GuideDashboard');
            break;
          default:
            setInitialRoute('Dashboard');
        }
      } else {
        setInitialRoute('AppForm');
      }

      setLoading(false);
    };

    checkUserLogin();
  }, []);

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <NavigationContainer>
        <StackNavigator initialRoute={initialRoute} />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignContent: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});