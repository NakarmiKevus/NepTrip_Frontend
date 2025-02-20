// loginform/App.js
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import AppForm from './App/Components/AppForm';
import ImageUploader from './App/Components/ImageUploader';
import SignupForm from './App/Components/SignupForm';




// Import UserProfile from nep_trip

const Stack = createStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen component={AppForm} name="AppForm" />
      <Stack.Screen component={SignupForm} name="SignupForm" />
      <Stack.Screen component={ImageUploader} name="ImageUpload" />

    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}