import React, {useRef, useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  TextInputKeyPressEventData,
  NativeSyntheticEvent,
  Image,
  Dimensions,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useNavigation, useRoute} from '@react-navigation/native';
import {Black, Gold, Gray, LightGold, White} from '../../constants/Color';
import {useMutation} from '@tanstack/react-query';
import {verifyOtp} from '../../constants/Api';
import {useAuthStore} from '../../store/authStore';
import { ShowToast } from '../../lib/Toast';

const {width} = Dimensions.get('window');

export default function OtpScreen() {
  const route = useRoute();
  const {mobileNumber}: any = route.params ?? '';
  const [otp, setOtp] = useState(['', '', '', '']);
  const navigation: any = useNavigation();
  const SETUSER = useAuthStore(state => state.setUser);
  const SETTOKEN = useAuthStore(state => state.setToken);
  const [isLoading, setIsLoading] = useState(false);

  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
  //   const key = e.nativeEvent.key;
    
  //   if (key === 'Backspace') {
  //     if (otp[index] === '' && index > 0) {
  //       inputRefs[index - 1].current?.focus();
        
  //       const newOtp = [...otp];
  //       newOtp[index - 1] = '';
  //       setOtp(newOtp);
  //     }
  //   }
  // };
  
  // const handleInputChange = (text: string, index: number) => {
  //   if (!/^\d*$/.test(text)) {
  //     return;
  //   }
    
  //   const newOtp = [...otp];
  //   newOtp[index] = text;
  //   setOtp(newOtp);
    
  //   if (text && index < inputRefs.length - 1) {
  //     inputRefs[index + 1].current?.focus();
  //   }
  // };
  
  const handlePaste = (text: string, startIndex: number) => {
    // Only use digits from pasted text
    const digits = text.replace(/\D/g, '').split('').slice(0, 4);
    
    const newOtp = [...otp];
    digits.forEach((digit, idx) => {
      if (startIndex + idx < 4) {
        newOtp[startIndex + idx] = digit;
      }
    });
    
    setOtp(newOtp);
    
    // Focus on appropriate input after paste
    if (startIndex + digits.length < 4) {
      inputRefs[startIndex + digits.length].current?.focus();
    } else {
      inputRefs[3].current?.focus();
    }
  };
  
  // const handleSelectionChange = (e: any, index: number) => {
  //   const {start, end} = e.nativeEvent.selection;
    
  //   if (start === 0 && end === 0 && index > 0 && otp[index] === '') {
  //     inputRefs[index - 1].current?.focus();
  //   }
  // };


    // Handle key press events
    const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
      const key = e.nativeEvent.key;
      
      // Handle backspace
      if (key === 'Backspace') {
        // If current input is empty and we're not at the first input, move to previous input
        if (otp[index] === '' && index > 0) {
          // Move to previous input
          inputRefs[index - 1].current?.focus();
          
          // Clear the previous input (optional, depending on desired behavior)
          const newOtp = [...otp];
          newOtp[index - 1] = '';
          setOtp(newOtp);
        }
      }
    };
  
    // Handle input changes
    const handleInputChange = (text: string, index: number) => {
      // Only allow numbers
      if (!/^\d*$/.test(text)) {
        return;
      }
      
      const newOtp = [...otp];
      newOtp[index] = text;
      setOtp(newOtp);
      
      // If text is entered and not at last input, move to next input
      if (text && index < inputRefs.length - 1) {
        inputRefs[index + 1].current?.focus();
      }
    };
  
    // Handle text selection to detect cursor position
    const handleSelectionChange = (e: any, index: number) => {
      const { start, end } = e.nativeEvent.selection;
      
      // If cursor is at position 0 and backspace is pressed, we need to move to previous input
      if (start === 0 && end === 0 && index > 0 && otp[index] === '') {
        inputRefs[index - 1].current?.focus();
      }
    };


  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (response) => {
      setIsLoading(false);
      if (response.data.data.user.registrationComplete) {
        SETTOKEN({access_token: response.data.data.access_token, refresh_token: response.data.data.refresh_token});
        SETUSER(response.data.data.user);
        navigation.reset({
          index: 0,
          routes: [{name: 'Main'}],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{name: 'Signup', params: {mobileNumber}}],
        });
      }
    },
    onError: (error: any) => {
      setIsLoading(false);
      console.log("verify otp mutation error", error);
      ShowToast(error.response.data.message, {type: 'error'});
    }
  });

  const handleVerify = async () => {
    if (otp.join('').length !== 4) {
      return null;
    }
    
    setIsLoading(true);
    verifyOtpMutation.mutateAsync({
      phone: mobileNumber,
      otp: otp.join(''),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <View style={styles.backRow}>
            <Ionicons name="chevron-back" size={20} color={White} />
            <Text style={styles.backText}>Back</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.content}>
          <Image 
            source={require('../../assets/logo/mainLogo.png')} 
            style={styles.logo} 
            resizeMode="contain"
          />

          <Text style={styles.header}>Phone Verification</Text>
          <Text style={styles.subText}>Enter your OTP code sent to {mobileNumber}</Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={inputRefs[index]}
                style={[styles.otpBox, digit !== '' && styles.filledBox]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onKeyPress={e => handleKeyPress(e, index)}
                onChangeText={text => {
                  // Check if text length > 1, which likely means it was pasted
                  if (text.length > 1) {
                    handlePaste(text, index);
                  } else {
                    handleInputChange(text, index);
                  }
                }}
                onSelectionChange={(e) => handleSelectionChange(e, index)}
                autoFocus={index === 0}
                selectTextOnFocus={true}
                caretHidden={false}
              />
            ))}
          </View>
          
          {/* <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            <TouchableOpacity>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </View>

      <TouchableOpacity 
        style={[
          styles.verifyButton, 
          // isLoading && styles.verifyButtonDisabled,
          // otp.join('').length !== 4 && styles.verifyButtonDisabled
        ]} 
        onPress={handleVerify}
        disabled={isLoading || otp.join('').length !== 4}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingDot} />
            <View style={styles.loadingDot} />
            <View style={styles.loadingDot} />
          </View>
        ) : (
          <Text style={styles.verifyText}>Verify</Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Black,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  backButton: {
    marginTop: 10,
    marginBottom: 10,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: White,
    fontSize: 16,
    marginLeft: 4,
  },
  content: {
    alignItems: 'center',
    marginTop: 20,
  },
  logo: {
    height: 80,
    width: width * 0.6,
    marginBottom: 20,
  },
  header: {
    color: LightGold,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 12,
  },
  subText: {
    color: Gray,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: '80%',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 30,
  },
  otpBox: {
    width: 65,
    height: 65,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    borderRadius: 12,
    backgroundColor: 'rgba(53, 56, 63, 0.8)',
    color: White,
  },
  filledBox: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: Gold,
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  resendText: {
    color: Gray,
    fontSize: 16,
  },
  resendLink: {
    color: Gold,
    fontWeight: '600',
    fontSize: 16,
  },
  verifyButton: {
    backgroundColor: Gold,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 35,
    shadowColor: Gold,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  // verifyButtonDisabled: {
  //   backgroundColor: 'rgba(212, 175, 55, 0.5)',
  // },
  verifyText: {
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
  },
});