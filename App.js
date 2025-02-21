import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

// Import components
import AppForm from './App/Components/AppForm';
import ImageUploader from './App/Components/ImageUploader';
import LoginForm from './App/Pages/LoginForm';
import SignupForm from './App/Pages/SignupForm';
import Dashboard from './App/Pages/Dashboard';
import { GuideScreen } from './App/Pages/Guide';
import { UserProfile } from './App/Pages/UserProfile';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Explore':
              iconName = 'compass';
              break;
            case 'Guide':
              iconName = 'map';
              break;
            case 'Navigate':
              iconName = 'navigation';
              break;
            case 'Weather':
              iconName = 'cloud';
              break;
            case 'Profile':
              iconName = 'user';
              break;
            default:
              iconName = 'circle';
          }

          return <Feather name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2196F3',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
      })}
    >
      <Tab.Screen name="Explore" component={Dashboard} />
      <Tab.Screen name="Guide" component={GuideScreen} />
      <Tab.Screen name="Navigate" component={Dashboard} />
      <Tab.Screen name="Weather" component={Dashboard} />
      <Tab.Screen name="Profile" component={UserProfile} />
    </Tab.Navigator>
  );
};

const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Start with AppForm as the landing page */}
      <Stack.Screen name="AppForm" component={AppForm} />
      <Stack.Screen name="LoginForm" component={LoginForm} />
      <Stack.Screen name="SignupForm" component={SignupForm} />
      <Stack.Screen name="ImageUpload" component={ImageUploader} />

      {/* After login, show the bottom tab navigator */}
      <Stack.Screen name="Dashboard" component={BottomTabNavigator} />
    </Stack.Navigator>
  );
};

// 📌 Main App Component
export default function App() {
  return (
    <View style={styles.mainContainer}>
      <NavigationContainer>
        <StackNavigator />
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    alignContent: 'center',
  },
});