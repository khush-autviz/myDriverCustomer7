

import 'react-native-reanimated';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Home from './src/components/Home';
import Onboarding from './src/screens/Onboarding';
import Signin from './src/components/auth/Signin';
import Signup from './src/components/auth/Signup';
import { Black, Gold } from './src/constants/Color';
import OtpScreen from './src/components/auth/OtpScreen';
import Search from './src/components/Search';
import Profile from './src/components/Profile';
import Activity from './src/components/Activity';
import Account from './src/screens/Account';
import Splash from './src/screens/Splash';
import Location from './src/screens/Location';
import TripDetails from './src/components/TripDetails';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LocationProvider } from './src/context/LocationProvider';
import { SocketProvider } from './src/context/SocketContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Toast } from './src/lib/Toast';
import Ratings from './src/components/Ratings';
import RideDetails from './src/components/RideDetails';


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const queryClient = new QueryClient();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = '';

          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Activity') {
            iconName = 'document-text';
          } else if (route.name === 'Account') {
            iconName = 'person';
          } else {
            iconName = 'ellipse';
          }

          return <Ionicons name={iconName} size={size} color={Gold} />;
        },
        tabBarStyle: {
          backgroundColor: Black,
        },
        tabBarLabelStyle: {
          color: Gold,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Home" component={Home} />
      <Tab.Screen name="Activity" component={Activity} />
      <Tab.Screen name="Account" component={Account} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <LocationProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: Black }}>
        <QueryClientProvider client={queryClient}>
          <SocketProvider>
            <SafeAreaView style={{ flex: 1 }}>
            <NavigationContainer>
              <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
                {/* Splash Screen */}
                <Stack.Screen name="Splash" component={Splash} />
                
                {/* Onboarding Screen */}
                <Stack.Screen name="Onboarding" component={Onboarding} />
                
                {/* Auth Screens */}
                <Stack.Screen name="Signin" component={Signin} />
                <Stack.Screen name="Signup" component={Signup} />
                <Stack.Screen name="OtpScreen" component={OtpScreen} />
                <Stack.Screen name="Location" component={Location} />
                <Stack.Screen name="TripDetails" component={TripDetails} />
                <Stack.Screen name="Profile" component={Profile} />
                <Stack.Screen name="Ratings" component={Ratings} />
                <Stack.Screen name="RideDetails" component={RideDetails} />
                
                {/* Main Tabs */}
                <Stack.Screen name="Main" component={MainTabs} />
              </Stack.Navigator>
              <Toast />
            </NavigationContainer>
            </SafeAreaView>
          </SocketProvider>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </LocationProvider>
  );

}