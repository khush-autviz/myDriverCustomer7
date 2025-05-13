import React, {useState, useRef} from 'react';
import {
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Black, Gold, Gray, White} from '../../constants/Color';
import {useNavigation} from '@react-navigation/native';
import {useMutation} from '@tanstack/react-query';
import {authSignin} from '../../constants/Api';
import PhoneInput from 'react-native-phone-number-input';

export default function Signin() {
  const navigation: any = useNavigation();
  const [value, setValue] = useState('');
  const [formattedValue, setFormattedValue] = useState('');
  const [mobileNumber, setmobileNumber] = useState('');
  const phoneInput = useRef<PhoneInput>(null);

  // signin or signup mutation
  const authMutation = useMutation({
    mutationFn: authSignin,
    onSuccess: (response) => {
      console.log('auth mutation success', response);
      navigation.navigate('OtpScreen', {mobileNumber});
    },
    onError: (error: any) => {
      console.log('auth mutation error', error);
    },
  });

  const handleSignin = async () => {
    if (value.trim() === '') {
      console.log('empty number');
      return null;
    }

    const phone = formattedValue;
    setmobileNumber(phone);
    console.log('phone', phone);

    authMutation.mutateAsync({phone});
  };

  return (
    <SafeAreaView
      style={{
        backgroundColor: Black,
        flex: 1,
        paddingTop: 70,
      }}>
      <View style={{flex: 1, marginHorizontal: 20}}>
        <Image
          source={require('../../assets/logo/mainLogo.png')}
          height={100}
          style={{marginTop: 15}}
        />

        <Text
          style={{
            color: White,
            fontWeight: '500',
            fontSize: 24,
            marginTop: 50,
          }}>
          Sign In
        </Text>
        <Text style={{color: Gray, marginTop: 20, fontSize: 15}}>
          Phone Number
        </Text>
        
        <PhoneInput
          ref={phoneInput}
          defaultValue={value}
          defaultCode="ZA"
          layout="first"
          onChangeText={(text) => {
            setValue(text);
          }}
          onChangeFormattedText={(text) => {
            setFormattedValue(text);
          }}
          disableArrowIcon={false}
          containerStyle={{
            marginTop: 10,
            width: '100%',
            backgroundColor: 'rgba(53, 56, 63, 0.8)',
            borderRadius: 8,
            height: 50,
          }}
          textContainerStyle={{
            backgroundColor: 'transparent',
            borderLeftWidth: 1,
            borderLeftColor: Gray,
            height: 50,
            paddingVertical: 0,
          }}
          textInputStyle={{
            color: White,
            height: 50,
            padding: 0,
          }}
          codeTextStyle={{
            color: White,
            marginTop: 0,
            padding: 0,
          }}
          flagButtonStyle={{
            backgroundColor: 'transparent',
            height: 50,
          }}
          countryPickerButtonStyle={{
            height: 50,
          }}
        />
        
        <TouchableOpacity
          style={{
            backgroundColor: Gold,
            height: 50,
            borderRadius: 8,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: 30,
          }}
          onPress={handleSignin}>
          <Text style={{color: White, fontWeight: '500'}}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  lineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  text: {
    marginHorizontal: 10,
    fontSize: 14,
    color: '#999',
  },
  image: {
    width: '100%',
    height: 250,
  },
});