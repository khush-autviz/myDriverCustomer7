

import React, {useState, useRef, useEffect} from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {Black, DarkGray, Gold, Gray, White, LightGold} from '../../constants/Color';
import {useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {authSignin} from '../../constants/Api';
import PhoneInput from 'react-native-phone-number-input';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ShowToast } from '../../lib/Toast';

const {width} = Dimensions.get('window');

export default function Signin() {
  const navigation: any = useNavigation();
  const [value, setValue] = useState('');
  const [formattedValue, setFormattedValue] = useState('');
  const [mobileNumber, setmobileNumber] = useState('');
  const phoneInput = useRef<PhoneInput>(null);
  const [isValid, setIsValid] = useState(true);
  
  // Animation values
  // const fadeAnim = useRef(new Animated.Value(0)).current;
  // const slideAnim = useRef(new Animated.Value(50)).current;
  
  // useEffect(() => {
  //   // Start animations when component mounts
  //   Animated.parallel([
  //     Animated.timing(fadeAnim, {
  //       toValue: 1,
  //       duration: 800,
  //       useNativeDriver: true,
  //     }),
  //     Animated.timing(slideAnim, {
  //       toValue: 0,
  //       duration: 800,
  //       useNativeDriver: true,
  //     }),
  //   ]).start();
  // }, []);

  // signin or signup mutation
  const authMutation = useMutation({
    mutationFn: authSignin,
    onSuccess: (response) => {
      console.log('auth mutation success', response);
      navigation.navigate('OtpScreen', {mobileNumber});
    },
    onError: (error: any) => {
      console.log('auth mutation error', error);
      ShowToast(error.response.data.message, {type: 'error'});
    },
  });

  const handleSignin = async () => {
    if (value.trim() === '') {
      setIsValid(false);
      return null;
    }

    const isValidNumber = phoneInput.current?.isValidNumber(value);
    if (!isValidNumber) {
      setIsValid(false);
      return null;
    }

    setIsValid(true);
    const phone = formattedValue;
    setmobileNumber(phone);
    console.log('phone', phone);

    authMutation.mutateAsync({phone});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <SafeAreaView style={styles.container}>
        <View style={styles.contentContainer}>
          {/* Logo and Header Section */}
          <Animated.View 
            style={[
              styles.headerContainer, 
              // {opacity: fadeAnim, transform: [{translateY: slideAnim}]}
            ]}
          >
            <Image
              source={require('../../assets/logo/mainLogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            
            <Text style={styles.welcomeText}>Welcome</Text>
            <Text style={styles.subtitleText}>
              Enter your phone number to continue
            </Text>
          </Animated.View>

          {/* Phone Input Section */}
          <Animated.View 
            style={[
              styles.formContainer,
              // {opacity: fadeAnim, transform: [{translateY: slideAnim}]}
            ]}
          >
            <Text style={styles.inputLabel}>Phone Number</Text>
            
            <View style={styles.phoneInputWrapper}>
              <PhoneInput
                ref={phoneInput}
                defaultValue={value}
                defaultCode="ZA"
                layout="first"
                onChangeText={(text) => {
                  setValue(text);
                  setIsValid(true);
                }}
                onChangeFormattedText={(text) => {
                  setFormattedValue(text);
                }}
                disableArrowIcon={true}
                containerStyle={[
                  styles.phoneInputContainer,
                  !isValid && styles.phoneInputError
                ]}
                textContainerStyle={styles.phoneInputTextContainer}
                textInputStyle={styles.phoneInputText}
                codeTextStyle={styles.phoneInputCodeText}
                countryPickerProps={{
                  withFilter: true,
                  theme: {
                    backgroundColor: '#1a1a1a',
                    onBackgroundTextColor: '#ffffff',
                  },
                }}
              />
              {!isValid && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={16} color="#FF6B6B" />
                  <Text style={styles.errorText}>Please enter a valid phone number</Text>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={[
                styles.signInButton,
                authMutation.isPending && styles.signInButtonDisabled
              ]}
              onPress={handleSignin}
              disabled={authMutation.isPending}>
              {authMutation.isPending ? (
                  <ActivityIndicator size="small" color={Black} />
                ) : (
                <Text style={styles.signInButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          {/* Footer Section */}
          {/* <Animated.View 
            style={[
              styles.footerContainer,
              {opacity: fadeAnim}
            ]}
          >
            <View style={styles.lineContainer}>
              <View style={styles.line} />
              <Text style={styles.orText}>OR</Text>
              <View style={styles.line} />
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Don't have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          </Animated.View> */}
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    // justifyContent: 'space-between',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    height: 80,
    width: width * 0.6,
    marginBottom: 30,
  },
  welcomeText: {
    color: LightGold,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitleText: {
    color: Gray,
    fontSize: 16,
    textAlign: 'center',
    maxWidth: '80%',
  },
  formContainer: {
    width: '100%',
    marginBottom: 40,
  },
  inputLabel: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  phoneInputWrapper: {
    marginBottom: 24,
  },
  phoneInputContainer: {
    width: '100%',
    backgroundColor: 'rgba(53, 56, 63, 0.8)',
    borderRadius: 12,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  phoneInputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  phoneInputTextContainer: {
    backgroundColor: 'transparent',
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.1)',
    height: 56,
    paddingVertical: 0,
  },
  phoneInputText: {
    color: White,
    height: 56,
    padding: 0,
    fontSize: 16,
  },
  phoneInputCodeText: {
    color: Gray,
    marginTop: 0,
    padding: 0,
    fontSize: 16,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 6,
  },
  signInButton: {
    backgroundColor: Gold,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Gold,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signInButtonDisabled: {
    // backgroundColor: 'rgba(212, 175, 55, 0.5)',
  },
  signInButtonText: {
    color: Black,
    fontWeight: '700',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Black,
    marginHorizontal: 4,
    opacity: 0.7,
    transform: [{scale: 1}],
    // animationName: 'bounce',
    // animationDuration: '1.5s',
    // animationIterationCount: 'infinite',
    // animationDelay: '0s, 0.2s, 0.4s',
  },
  footerContainer: {
    marginBottom: 30,
  },
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  orText: {
    color: Gray,
    marginHorizontal: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    color: Gray,
    fontSize: 16,
  },
  signupLink: {
    color: Gold,
    fontSize: 16,
    fontWeight: '600',
  },
});