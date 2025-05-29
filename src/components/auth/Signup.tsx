// import React, {useState} from 'react';
// import {
//   Image,
//   KeyboardAvoidingView,
//   Platform,
//   SafeAreaView,
//   StyleSheet,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import {Black, Gold, Gray, White} from '../../constants/Color';
// import {useNavigation, useRoute} from '@react-navigation/native';
// import Ionicons from 'react-native-vector-icons/Ionicons';
// import axios from 'axios';
// import Logo from '../../assets/logo/mainLogo.svg'
// import { useAuthStore } from '../../store/authStore';
// import { useMutation } from '@tanstack/react-query';
// import { authSignup } from '../../constants/Api';
// import { ScrollView } from 'react-native-gesture-handler';

// export default function Signup() {
//   const SETUSER = useAuthStore(state => state.setUser)
//   const SETTOKEN = useAuthStore(state => state.setToken)
//   const route = useRoute();
//   const {mobileNumber}: any = ''
//   const [formData, setformData] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     phone: mobileNumber,
//   });
//   const navigation: any = useNavigation();

//   const handleFormData = (field: string, value: string) => {
//     setformData(prev => ({
//       ...prev,
//       [field]: value,
//     }));
//   };

//   // signup mutation
//   const registerMutation = useMutation({
//     mutationFn: authSignup,
//     onSuccess: (response) => {
//       console.log("register mutation success", response);
//       SETUSER(response.data.data.user)
//       SETTOKEN({access_token: response.data.data.access_token, refresh_token: response.data.data.refresh_token})
//       navigation.navigate('Main')
//     },
//     onError: (error: any) => {
//       console.log("register mutation error", error);
//     }
//   })


//   const handleSignup = async () => {
//     const {firstName, lastName, email} = formData;
//     if (
//       firstName.trim() === '' ||
//       lastName.trim() === '' ||
//       email.trim() === ''
//     ) {
//       return null;
//     }

//     // try {
//     //   const response = await axios.post(
//     //     'http://localhost:3000/auth/register',
//     //     formData,
//     //   );
//     //   console.log('register succss', response);
//     //   if (response.data.data.userId) {
//     //     navigation.navigate('OtpScreen', 
//     //       {phone}
//     //     );
//     //   }
//     // } catch (error) {
//     //   console.log('register error', error);
//     // }
//     registerMutation.mutateAsync(formData)
//   };

//   return (
//     <KeyboardAvoidingView
//     behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//     style={{ flex: 1 }}
//     keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
//     <ScrollView style={{ flex: 1, backgroundColor: Black }}>
//       <SafeAreaView
//         style={{
//           backgroundColor: Black,
//           flex: 1,
//           paddingTop: 30,
//           paddingHorizontal: 20,
//           paddingBottom: 30,
//         }}>
//       <TouchableOpacity onPress={() => navigation.goBack()}>
//         <View style={styles.backRow}>
//           <Ionicons name="chevron-back" size={20} color={White} />
//           <Text style={styles.backText}> Back</Text>
//         </View>
//       </TouchableOpacity>
//       {/* <Logo height={100} width={300} style={{marginTop: 30}} /> */}
//       <Image source={require('../../assets/logo/mainLogo.png')} height={100} style={{marginTop: 30}} />

//       <Text
//         style={{color: White, fontWeight: '500', fontSize: 24, marginTop: 30}}>
//         Sign Up
//       </Text>
//       <Text style={{color: Gray, marginTop: 20, fontSize: 15}}>First Name</Text>
//       <TextInput
//         style={{
//           borderColor: White,
//           borderWidth: 1,
//           marginTop: 10,
//           paddingHorizontal: 20,
//           height: 50,
//           borderRadius: 8,
//           color: Gray,
//         }}
//         value={formData.firstName}
//         onChangeText={text => handleFormData('firstName', text)}
//         keyboardType="name-phone-pad"
//         placeholder="Enter your first name"
//       />
//       <Text style={{color: Gray, marginTop: 10, fontSize: 15}}>Last Name</Text>
//       <TextInput
//         style={{
//           borderColor: White,
//           borderWidth: 1,
//           marginTop: 10,
//           paddingHorizontal: 20,
//           height: 50,
//           borderRadius: 8,
//           color: Gray,
//         }}
//         value={formData.lastName}
//         onChangeText={text => handleFormData('lastName', text)}
//         keyboardType="name-phone-pad"
//         placeholder="Enter your last name"
//       />
//       <Text style={{color: Gray, marginTop: 10, fontSize: 15}}>Email</Text>

//       <TextInput
//         style={{
//           borderColor: White,
//           borderWidth: 1,
//           marginTop: 10,
//           paddingHorizontal: 20,
//           height: 50,
//           borderRadius: 8,
//           color: Gray,
//         }}
//         value={formData.email}
//         onChangeText={text => handleFormData('email', text)}
//         keyboardType="email-address"
//         placeholder="Enter your email"
//       />
//       {/* <Text style={{color: Gray, marginTop: 10, fontSize: 15}}>
//         Mobile Number
//       </Text>
//       <TextInput
//         style={{
//           borderColor: White,
//           borderWidth: 1,
//           marginTop: 10,
//           paddingHorizontal: 20,
//           height: 50,
//           borderRadius: 8,
//         }}
//         keyboardType="phone-pad"
//         placeholder="Enter your mobile number"
//       /> */}
//       <TouchableOpacity
//         style={{
//           backgroundColor: Gold,
//           height: 50,
//           borderRadius: 8,
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           marginTop: 30,
//         }}
//         onPress={handleSignup}>
//         <Text style={{color: White, fontWeight: '500'}}>Sign Up</Text>
//       </TouchableOpacity>
//       {/* <View style={styles.lineContainer}>
//         <View style={styles.line} />
//         <Text style={styles.text}>or</Text>
//         <View style={styles.line} />
//       </View> */}
//       {/* <View
//         style={{
//           display: 'flex',
//           justifyContent: 'center',
//           alignItems: 'center',
//           flexDirection: 'row',
//           marginTop: 20,
//         }}>
//         <Text style={{color: White, fontWeight: '500', fontSize: 16}}>
//           Already have an account?{' '}
//         </Text>
//         <TouchableOpacity onPress={() => navigation.navigate('Signin')}>
//           <Text style={{color: Gold, fontWeight: '500', fontSize: 16}}>
//             Sign In
//           </Text>
//         </TouchableOpacity>
//       </View> */}
//       </SafeAreaView>
//       </ScrollView>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   lineContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: 20,
//   },
//   line: {
//     flex: 1,
//     height: 1,
//     backgroundColor: '#ccc',
//   },
//   text: {
//     marginHorizontal: 10,
//     fontSize: 14,
//     color: '#999',
//   },
//   backRow: {
//     flexDirection: 'row',
//   },
//   backText: {
//     color: White,
//   },
// });







import React, {useState} from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import {Black, DarkGray, Gold, Gray, White, LightGold} from '../../constants/Color';
import {useNavigation, useRoute} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useMutation} from '@tanstack/react-query';
import {authSignup} from '../../constants/Api';
import {useAuthStore} from '../../store/authStore';

const {width} = Dimensions.get('window');

export default function Signup() {
  const SETUSER = useAuthStore(state => state.setUser);
  const SETTOKEN = useAuthStore(state => state.setToken);
  const route = useRoute();
  const {mobileNumber}: any = route.params || {mobileNumber: ''};
  const [formData, setformData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: mobileNumber,
  });
  const navigation: any = useNavigation();
  const [formErrors, setFormErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
  });

  const handleFormData = (field: string, value: string) => {
    setformData(prev => ({
      ...prev,
      [field]: value,
    }));
    
    // Clear error when user types
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: false,
      }));
    }
  };

  // Validate email format
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // signup mutation
  const registerMutation = useMutation({
    mutationFn: authSignup,
    onSuccess: (response) => {
      console.log("register mutation success", response);
      SETUSER(response.data.data.user);
      SETTOKEN({
        access_token: response.data.data.access_token, 
        refresh_token: response.data.data.refresh_token
      });
      navigation.navigate('Main');
    },
    onError: (error: any) => {
      console.log("register mutation error", error);
    }
  });

  const validateForm = () => {
    const errors = {
      firstName: formData.firstName.trim() === '',
      lastName: formData.lastName.trim() === '',
      email: formData.email.trim() === '' || !isValidEmail(formData.email),
    };
    
    setFormErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return null;
    }

    registerMutation.mutateAsync(formData);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView style={styles.scrollView}>
        <SafeAreaView style={styles.container}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <View style={styles.backRow}>
              <Ionicons name="chevron-back" size={20} color={White} />
              <Text style={styles.backText}>Back</Text>
            </View>
          </TouchableOpacity>

          {/* Logo and Header Section */}
          <View style={styles.headerContainer}>
            <Image
              source={require('../../assets/logo/mainLogo.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            
            <Text style={styles.welcomeText}>Create Account</Text>
            <Text style={styles.subtitleText}>
              Please fill in your details to complete registration
            </Text>
          </View>

          {/* Form Section */}
          <View style={styles.formContainer}>
            
            {/* First Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={[
                  styles.textInput,
                  formErrors.firstName && styles.inputError
                ]}
                value={formData.firstName}
                onChangeText={text => handleFormData('firstName', text)}
                placeholder="Enter your first name"
                placeholderTextColor={Gray}
              />
              {formErrors.firstName && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={16} color="#FF6B6B" />
                  <Text style={styles.errorText}>First name is required</Text>
                </View>
              )}
            </View>
            
            {/* Last Name Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={[
                  styles.textInput,
                  formErrors.lastName && styles.inputError
                ]}
                value={formData.lastName}
                onChangeText={text => handleFormData('lastName', text)}
                placeholder="Enter your last name"
                placeholderTextColor={Gray}
              />
              {formErrors.lastName && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={16} color="#FF6B6B" />
                  <Text style={styles.errorText}>Last name is required</Text>
                </View>
              )}
            </View>
            
            {/* Email Field */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={[
                  styles.textInput,
                  formErrors.email && styles.inputError
                ]}
                value={formData.email}
                onChangeText={text => handleFormData('email', text)}
                keyboardType="email-address"
                placeholder="Enter your email"
                placeholderTextColor={Gray}
                autoCapitalize="none"
              />
              {formErrors.email && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={16} color="#FF6B6B" />
                  <Text style={styles.errorText}>Please enter a valid email</Text>
                </View>
              )}
            </View>
            
            {/* Phone Number Display */}
            {mobileNumber && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <View style={styles.phoneDisplay}>
                  <Ionicons name="call-outline" size={18} color={Gray} style={styles.phoneIcon} />
                  <Text style={styles.phoneText}>{mobileNumber}</Text>
                </View>
              </View>
            )}

            {/* Signup Button */}
            <TouchableOpacity
              style={[
                styles.signupButton,
                // registerMutation.isPending && styles.signupButtonDisabled
              ]}
              onPress={handleSignup}
              disabled={registerMutation.isPending}>
              {registerMutation.isPending ? (
                <ActivityIndicator size="small" color={Black} />
              ) : (
                <Text style={styles.signupButtonText}>Complete Registration</Text>
              )}
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: Black,
  },
  container: {
    flex: 1,
    backgroundColor: Black,
    paddingTop: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
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
  headerContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 10,
  },
  logo: {
    height: 70,
    width: width * 0.5,
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
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  textInput: {
    borderColor: DarkGray,
    borderWidth: 1,
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 12,
    color: White,
    backgroundColor: 'rgba(53, 56, 63, 0.5)',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 14,
    marginLeft: 6,
  },
  phoneDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: DarkGray,
    borderWidth: 1,
    paddingHorizontal: 20,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(53, 56, 63, 0.5)',
  },
  phoneIcon: {
    marginRight: 10,
  },
  phoneText: {
    color: White,
    fontSize: 16,
  },
  signupButton: {
    backgroundColor: Gold,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: Gold,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  signupButtonDisabled: {
    // backgroundColor: 'rgba(212, 175, 55, 0.5)',
  },
  signupButtonText: {
    color: Black,
    fontWeight: '700',
    fontSize: 16,
  },
});