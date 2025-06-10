import { View, Text, Image, TouchableOpacity, TextInput, Platform } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Black, Gold, Gray, White } from '../constants/Color'
import { useAuthStore } from '../store/authStore'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useMutation, useQuery } from '@tanstack/react-query'
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker'
import { editProfile, getProfile } from '../constants/Api'
import { ShowToast } from '../lib/Toast'
import Loader from './Loader'


export default function Profile() {
  // const USER = useAuthStore(state => state.user)
  const [buttonDisabled, setbuttonDisabled] = useState(true)
  const { user, setUser } = useAuthStore()
  const navigation: any = useNavigation()
  const [data, setdata] = useState<any>({
    firstName: '',
    lastName: '',
    email: '',
    profileImage: null
  })


  // handle data
  const handledata = (field: string, value: any) => {
    setbuttonDisabled(false)
    setdata((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  // fetches user info
  const { data: UserDetails, isLoading, refetch } = useQuery({
    queryKey: ['user-details'],
    queryFn: getProfile,
    // staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  })

  // Handle image selection
  const handleImageUpload = async () => {
    // Simple options for image picker
    const options: ImageLibraryOptions = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 2000,
      maxWidth: 2000,
      selectionLimit: 1,
    };

    try {
      console.log('Launching image library...');
      const result = await launchImageLibrary(options);

      if (result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.uri) {
          console.log(`Selected image URI: ${asset.uri}`);
          handledata('profileImage', asset.uri);
        }
      }
    } catch (error) {
      console.error('Error in image picker:', error);
    }
  };

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: editProfile,
    onSuccess: (response) => {
      console.log('profile update success', response);
      setUser({ ...user, ...response?.data?.data })
      setbuttonDisabled(true)
      refetch()
      ShowToast('Profile updated successfully', { type: 'success' })
    },
    onError: (error: any) => {
      // Log the full error first
      console.log('Full error object:', error);

      // Then log specific parts that might be helpful
      const errorDetails = {
        message: error?.message || 'Unknown error',
        status: error?.response?.status,
        responseData: error?.response?.data,
      };
      console.log('Profile update error details:', errorDetails);

      ShowToast(error?.response?.data?.message || error?.message || 'Failed to update profile', { type: 'error' })
    }
  })

  // handles update
  const handleUpdate = () => {
    if (data?.email?.trim() === '' || data?.firstName?.trim() === '' || data?.lastName?.trim() === '') {
      ShowToast('Please fill all the fields', { type: 'error' })
      return
    }

    const formData = new FormData()

    // Add basic user info
    formData.append('firstName', data.firstName.trim())
    formData.append('lastName', data.lastName.trim())
    formData.append('email', data.email.trim())

    // Append profile photo if available and changed
    if (data.profileImage && !data.profileImage.startsWith('http')) {
      const photoName = data.profileImage.split('/').pop() || 'profile.jpg'
      const photoType = photoName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'

      const photoFile = {
        uri: Platform.OS === 'android' ? data.profileImage : data.profileImage.replace('file://', ''),
        type: photoType,
        name: photoName,
      }
      formData.append('profileImage', photoFile as any)

      // Log the photo file details separately
      console.log('Photo file details:', {
        uri: photoFile.uri,
        type: photoType,
        name: photoName
      })
    }

    // Log form data contents
    console.log('Form data being sent:', formData)

    updateProfileMutation.mutateAsync(formData)
  }


  useEffect(() => {
    if (UserDetails) {

      console.log('UserDetails', UserDetails)

      setdata({
        firstName: UserDetails?.data?.data?.firstName,
        lastName: UserDetails?.data?.data?.lastName,
        email: UserDetails?.data?.data?.email,
        profileImage: UserDetails?.data?.data?.profileImage,
      })
    }

  }, [UserDetails]);


  console.log('profile image', data.profileImage);
  


  return (
    <SafeAreaView style={{ paddingHorizontal: 20, flex: 1, backgroundColor: Black }}>
      {isLoading && <Loader />}
      <View style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 20 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} >
          <Ionicons name="chevron-back" size={20} color={Gold} />
        </TouchableOpacity>
        <Text style={{ color: Gold, fontSize: 20, fontWeight: '500' }}>Profile</Text>
      </View>
      <View style={{ display: 'flex', alignItems: 'center', marginTop: 40 }}>
        <TouchableOpacity onPress={handleImageUpload}>
          {data.profileImage ? (
            <Image
              source={{ uri: `https://t1wfswdh-3000.inc1.devtunnels.ms/${data.profileImage}` }}
              // source={{ uri: `http://3.110.180.116:3000/${data.profileImage}` }} 
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
          ) : (
            <Image
              source={require('..//assets/images/user.png')}
              style={{ width: 100, height: 100, borderRadius: 50 }}
            />
          )}
          <View style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            backgroundColor: Gold,
            borderRadius: 15,
            padding: 5
          }}>
            <Ionicons name="camera" size={20} color={White} />
          </View>
        </TouchableOpacity>
      </View>
      <Text style={{ color: White, fontSize: 20, textAlign: 'center', marginTop: 15, fontWeight: '500' }}>{user?.firstName + " " + user?.lastName}</Text>
      <Text style={{ color: Gray, marginTop: 20, fontSize: 15 }}>First Name</Text>
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
        value={data.firstName}
        onChangeText={text => handledata('firstName', text)}
      />
      <Text style={{ color: Gray, marginTop: 20, fontSize: 15 }}>Last Name</Text>
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
        value={data.lastName}
        onChangeText={text => handledata('lastName', text)}
      />
      <Text style={{ color: Gray, marginTop: 10, fontSize: 15 }}>Email</Text>
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
        value={data.email}
        keyboardType="email-address"
        placeholder="Enter your email"
        onChangeText={text => handledata('email', text)}
      />
      <Text style={{ color: Gray, marginTop: 10, fontSize: 15 }}>Mobile Number</Text>
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
        keyboardType="phone-pad"
        placeholder="Enter your mobile number"
        value={user?.phone}
        editable={false}
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
        disabled={buttonDisabled}
        onPress={handleUpdate}
      >
        <Text style={{ color: White, fontWeight: '500' }}>
          {updateProfileMutation.isPending ? 'Updating...' : 'Update'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}