import React, { useEffect } from 'react';
import { View, Image, StyleSheet, StatusBar } from 'react-native';
import { Black } from '../constants/Color';

const Splash = ({ navigation }) => {
  useEffect(() => {
    // Navigate to the next screen after a delay
    const timer = setTimeout(() => {
      navigation.replace('Onboarding');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

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