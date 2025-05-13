import { View, Text, Image, TouchableOpacity, TextInput } from 'react-native'
import React from 'react'
import { Black, Gold, Gray, White } from '../constants/Color'
import { useAuthStore } from '../store/authStore'
import Ionicons from 'react-native-vector-icons/Ionicons'

export default function Profile() {

  const USER = useAuthStore(state => state.user)

  return (
    <View style={{paddingHorizontal: 20, flex: 1, backgroundColor: Black}}>
      {/* <Ioni */}
      <Text style={{color: White, marginTop: 30, fontSize: 18, fontWeight: '500', textAlign: 'center'}}>Edit Profile</Text>
      <View style={{display: 'flex', alignItems: 'center', marginTop: 40}}>
      <Image source={require('../assets/images/user.png')} />
      </View>
      <Text style={{color: White, fontSize: 20, textAlign: 'center', marginTop: 15, fontWeight: '500'}}>{USER?.firstName + " " + USER?.lastName}</Text>
        <Text style={{color: Gray, marginTop: 20, fontSize: 15}}>First Name</Text>
              <TextInput
                style={{
                  borderColor: White,
                  borderWidth: 1,
                  marginTop: 10,
                  paddingHorizontal: 20,
                  height: 50,
                  borderRadius: 8,
                  color: White
                }}
                keyboardType="name-phone-pad"
                placeholder="Enter your name"
                value={USER?.firstName}
              />
        <Text style={{color: Gray, marginTop: 20, fontSize: 15}}>Last Name</Text>
              <TextInput
                style={{
                  borderColor: White,
                  borderWidth: 1,
                  marginTop: 10,
                  paddingHorizontal: 20,
                  height: 50,
                  borderRadius: 8,
                  color: White
                }}
                keyboardType="name-phone-pad"
                placeholder="Enter your name"
                value={USER?.lastName}
              />
              <Text style={{color: Gray, marginTop: 10, fontSize: 15}}>Email</Text>
        
              <TextInput
                style={{
                  borderColor: White,
                  borderWidth: 1,
                  marginTop: 10,
                  paddingHorizontal: 20,
                  height: 50,
                  borderRadius: 8,
                  color: White
                }}
                value={USER?.email}
                keyboardType="email-address"
                placeholder="Enter your email"
              />
              <Text style={{color: Gray, marginTop: 10, fontSize: 15}}>Mobile Number</Text>
        
              <TextInput
                style={{
                  borderColor: White,
                  borderWidth: 1,
                  marginTop: 10,
                  paddingHorizontal: 20,
                  height: 50,
                  borderRadius: 8,
                }}
                keyboardType="phone-pad"
                placeholder={USER?.phone}
                // value={USER?.phone}
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
                }}>
                <Text style={{color: White, fontWeight: '500'}}>Update</Text>
              </TouchableOpacity>
    </View>
  )
}