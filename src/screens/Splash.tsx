import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import { Black } from '../constants/Color';
import { useAuthStore } from '../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../constants/Api';

const Splash = ({ navigation }: {navigation: any}) => {
  const token = useAuthStore(state => state.token);
  const setRideId = useAuthStore(state => state.setRideId);

  // Better state management to prevent jerky behavior
  const [hasNavigated, setHasNavigated] = useState(false);
  const [minDisplayTime, setMinDisplayTime] = useState(false);
  const [networkTimeout, setNetworkTimeout] = useState(false);

  // user details query with improved configuration
  const {data: userDetails, isLoading, error, isError} = useQuery({
    queryKey: ['userDetails'],
    queryFn: getProfile,
    enabled: !!token,
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    retry: 2, // Reduced retry attempts to prevent long delays
    retryDelay: 1000, // 1 second between retries
    gcTime: 0, // Don't cache failed queries
  })

  console.log("userDetails", userDetails)
  console.log("token", token?.access_token)
  console.log("userDetails?.data?.data?.registrationComplete", userDetails?.data?.data?.registrationComplete)

  // Set minimum display time for splash screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinDisplayTime(true);
    }, 2000); // Show splash for at least 2 seconds

    return () => clearTimeout(timer);
  }, []);

  // Network timeout to prevent infinite waiting
  useEffect(() => {
    if (!token) return; // Only set timeout if we have a token and are making API calls

    const timeoutTimer = setTimeout(() => {
      console.log('Network timeout reached - proceeding with fallback navigation');
      setNetworkTimeout(true);
    }, 10000); // 10 second timeout for network operations

    return () => clearTimeout(timeoutTimer);
  }, [token]);

  // Improved navigation logic
  useEffect(() => {
    const handleNavigation = async () => {
      // Prevent multiple navigations
      if (hasNavigated) return;

      // Wait for minimum display time
      if (!minDisplayTime) return;

      try {
        const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');

        if (token && token.access_token) {
          // Check for network timeout or API error - proceed with fallback
          if (networkTimeout || (isError && error)) {
            console.error('Network timeout or API error:', error);
            setHasNavigated(true);
            // Fallback to signin screen so user can retry when connectivity returns
            navigation.replace('Signin');
            return;
          }

          // If we have a token, wait for profile data (unless timeout occurred)
          if (isLoading && !networkTimeout) return;

          if (userDetails?.data?.data) {
            setHasNavigated(true);
            
            if (!userDetails.data.data.registrationComplete) {
              navigation.replace('Signup', {mobileNumber: userDetails.data.data.phone});
            } else if (userDetails.data.data.currentRide) {
              setRideId(userDetails.data.data.currentRide);
              navigation.replace('TripDetails');
            } else {
              navigation.replace('Main');
            }
          } else if (networkTimeout) {
            // Network timeout without data - go to signin so user can retry
            setHasNavigated(true);
            navigation.replace('Signin');
          }
        } else {
          // No token - navigate to appropriate screen
          setHasNavigated(true);
          
          if (hasSeenOnboarding === 'true') {
            navigation.replace('Signin');
          } else {
            navigation.replace('Onboarding');
          }
        }
      } catch (error) {
        console.error('Error in splash navigation:', error);
        setHasNavigated(true);
        navigation.replace('Signin');
      }
    };

    handleNavigation();
  }, [token, userDetails, isLoading, error, isError, minDisplayTime, hasNavigated, networkTimeout, navigation, setRideId]);

  // Always show splash screen until navigation (no conditional rendering)
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={Black} barStyle="light-content" />
      <Image 
        source={require('../assets/logo/mainLogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: '70%',
    height: '30%',
  },
});

export default Splash;