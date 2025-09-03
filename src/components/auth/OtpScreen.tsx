import React, {useState} from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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
  const [otp, setOtp] = useState('');
  const navigation: any = useNavigation();
  const SETUSER = useAuthStore(state => state.setUser);
  const SETTOKEN = useAuthStore(state => state.setToken);


  const handleOtpChange = (text: string) => {
    // Only allow numbers and limit to 4 digits
    const numericText = text.replace(/[^0-9]/g, '').slice(0, 4);
    setOtp(numericText);
  };

  const verifyOtpMutation = useMutation({
    mutationFn: verifyOtp,
    onSuccess: (response) => {
      console.log("verify otp mutation success", response);
      SETTOKEN({access_token: response.data.data.access_token, refresh_token: response.data.data.refresh_token});
        SETUSER(response.data.data.user);
      if (response.data.data.user.registrationComplete) {
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
      console.log("verify otp mutation error", error);
      ShowToast(error.response.data.message, {type: 'error'});
    }
  });

  const handleVerify = async () => {
    if (otp.length !== 4) {
      ShowToast('Please enter 4-digit OTP', {type: 'error'});
      return;
    }
    
    verifyOtpMutation.mutateAsync({
      phone: mobileNumber,
      otp: otp,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1, backgroundColor: Black}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
    <SafeAreaView style={styles.safeArea}>
    <ScrollView
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.replace('Signin')}
        >
          <View style={styles.backRow}>\
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
          <Text style={styles.subText}>Enter your 4-digit OTP code sent to {mobileNumber}</Text>

          <View style={styles.otpInputContainer}>
            <TextInput
              style={styles.otpInput}
              value={otp}
              onChangeText={handleOtpChange}
              placeholder="Enter OTP"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              maxLength={4}
              autoFocus={true}
              selectionColor={Gold}
            />
            {/* {otp.length > 0 && (
              <Text style={styles.otpCounter}>{otp.length}/4</Text>
            )} */}
          </View>
          
          {/* <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            <TouchableOpacity>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          </View> */}
        </View>
      </View>
      </ScrollView>

      <TouchableOpacity 
        style={[
          styles.verifyButton,
          // (isLoading || otp.length !== 4) && styles.verifyButtonDisabled
        ]} 
        onPress={handleVerify}
        disabled={verifyOtpMutation.isPending || otp.length !== 4}
      >
        {verifyOtpMutation.isPending ? (
            <ActivityIndicator size="small" color={Black} />
          ) : (
          <Text style={[
            styles.verifyText,
            (otp.length !== 4) && styles.verifyTextDisabled
          ]}>
            Verify OTP
          </Text>
        )}
      </TouchableOpacity>
      {/* </ScrollView> */}
    </SafeAreaView>
    </KeyboardAvoidingView>
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
    // paddingTop: 20,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    // paddingTop: 20,
    paddingBottom: 40, // give space for keyboard
  },
  backButton: {
    // marginTop: 10,
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
    marginBottom: 10,
  },
  header: {
    color: LightGold,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 5,
  },
  subText: {
    color: Gray,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 25,
    maxWidth: '80%',
  },
  otpInputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 30,
  },
  otpInput: {
    width: '80%',
    height: 60,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: White,
    fontSize: 20,
    fontWeight: '600',
    paddingHorizontal: 20,
    textAlign: 'left',
    letterSpacing: 4,
  },
  otpCounter: {
    color: Gold,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 10,
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
    marginBottom: 15,
    shadowColor: Gold,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },  
  verifyButtonDisabled: {
    backgroundColor: 'rgba(212, 175, 55, 0.4)',
    shadowOpacity: 0.1,
  },
  verifyText: {
    color: Black,
    fontWeight: '700',
    fontSize: 16,
  },
  verifyTextDisabled: {
    color: 'rgba(0, 0, 0, 0.6)',
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