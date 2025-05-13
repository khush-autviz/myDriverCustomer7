// import React, { useEffect } from 'react';
// import { View, Image, StyleSheet, StatusBar } from 'react-native';
// import { Black } from '../constants/Color';

// const Splash = ({ navigation }) => {
//   useEffect(() => {
//     // Navigate to the next screen after a delay
//     const timer = setTimeout(() => {
//       navigation.replace('Onboarding');
//     }, 2000);

//     return () => clearTimeout(timer);
//   }, [navigation]);

//   return (
//     <View style={styles.container}>
//       <StatusBar backgroundColor={Black} barStyle="light-content" />
//       <Image 
//         source={require('../assets/logo/mainLogo.png')}
//         style={styles.logo}
//         resizeMode="contain"
//       />
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: Black,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   logo: {
//     width: '70%',
//     height: '30%',
//   },
// });

// export default Splash;


import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import { Black } from '../constants/Color';
import { useAuthStore } from '../store/authStore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Splash = ({ navigation }) => {
  const token = useAuthStore(state => state.token);
  
  useEffect(() => {
    const checkAuthAndOnboarding = async () => {
      // Check if user has seen onboarding
      const hasSeenOnboarding = await AsyncStorage.getItem('hasSeenOnboarding');
      
      // Wait for 2 seconds to show splash screen
      setTimeout(() => {
        if (token && token.access_token) {
          // If token exists, navigate to Main tabs
          navigation.replace('Main');
        } else if (hasSeenOnboarding === 'true') {
          // If user has seen onboarding but no token, go to Signin
          navigation.replace('Signin');
        } else {
          // If user hasn't seen onboarding, go to Onboarding
          navigation.replace('Onboarding');
        }
      }, 2000);
    };

    checkAuthAndOnboarding();
  }, [navigation, token]);

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