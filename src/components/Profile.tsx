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
    profilePhoto: null
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
    const {data: UserDetails, isLoading} = useQuery({
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
          handledata('profilePhoto', asset.uri);
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
      setUser({...user, ...response?.data})
      setbuttonDisabled(true)
    },
    onError: (error) => {
      console.log('profile update error', error);
      ShowToast(error?.message ,{type: 'error'})
    }
  })

  // handles update
  const handleUpdate = () => {
    if (data?.email?.trim() === '' || data?.firstName?.trim() === '' || data?.lastName?.trim() === '') {
      ShowToast('Please fill all the fields', {type: 'error'})
      return
    }

    const formData = new FormData()

    formData.append('driverId', user?.id)
    formData.append('firstName', data.firstName)
    formData.append('lastName', data.lastName)
    formData.append('email', data.email)

    // Append profile photo if available
    if (data.profilePhoto) {
      const photoName = data?.profilePhoto?.split('/').pop() || 'profile.jpg';
      const photoType = photoName.endsWith('.png') ? 'image/png' : 'image/jpeg';
      
    //   // @ts-ignore - TypeScript doesn't recognize the FormData append with file object
      formData.append('profilePhoto', {
        uri: Platform.OS === 'android' ? data.profilePhoto : data.profilePhoto.replace('file://', ''),
        type: photoType,
        name: photoName,
      });
    }
    
    console.log("UserDetails formData", formData);

    updateProfileMutation.mutateAsync(formData)
  }


useEffect(() => {
  if (UserDetails) {
    
    setdata({
      firstName: UserDetails?.data?.data?.firstName,
      lastName: UserDetails?.data?.data?.lastName,
      email: UserDetails?.data?.data?.email,
      profilePhoto: UserDetails?.data?.data?.documents?.profilePhoto?.image,
    })
  }

}, [UserDetails]);




  return (
    // <View style={{paddingHorizontal: 20, flex: 1, backgroundColor: Black}}>
    //   {/* <Ioni */}
    //   <Text style={{color: White, marginTop: 30, fontSize: 18, fontWeight: '500', textAlign: 'center'}}>Edit Profile</Text>
    //   <View style={{display: 'flex', alignItems: 'center', marginTop: 40}}>
    //   <Image source={require('../assets/images/user.png')} />
    //   </View>
    //   <Text style={{color: White, fontSize: 20, textAlign: 'center', marginTop: 15, fontWeight: '500'}}>{USER?.firstName + " " + USER?.lastName}</Text>
    //     <Text style={{color: Gray, marginTop: 20, fontSize: 15}}>First Name</Text>
    //           <TextInput
    //             style={{
    //               borderColor: White,
    //               borderWidth: 1,
    //               marginTop: 10,
    //               paddingHorizontal: 20,
    //               height: 50,
    //               borderRadius: 8,
    //               color: White
    //             }}
    //             keyboardType="name-phone-pad"
    //             placeholder="Enter your name"
    //             value={USER?.firstName}
    //           />
    //     <Text style={{color: Gray, marginTop: 20, fontSize: 15}}>Last Name</Text>
    //           <TextInput
    //             style={{
    //               borderColor: White,
    //               borderWidth: 1,
    //               marginTop: 10,
    //               paddingHorizontal: 20,
    //               height: 50,
    //               borderRadius: 8,
    //               color: White
    //             }}
    //             keyboardType="name-phone-pad"
    //             placeholder="Enter your name"
    //             value={USER?.lastName}
    //           />
    //           <Text style={{color: Gray, marginTop: 10, fontSize: 15}}>Email</Text>
        
    //           <TextInput
    //             style={{
    //               borderColor: White,
    //               borderWidth: 1,
    //               marginTop: 10,
    //               paddingHorizontal: 20,
    //               height: 50,
    //               borderRadius: 8,
    //               color: White
    //             }}
    //             value={USER?.email}
    //             keyboardType="email-address"
    //             placeholder="Enter your email"
    //           />
    //           <Text style={{color: Gray, marginTop: 10, fontSize: 15}}>Mobile Number</Text>
        
    //           <TextInput
    //             style={{
    //               borderColor: White,
    //               borderWidth: 1,
    //               marginTop: 10,
    //               paddingHorizontal: 20,
    //               height: 50,
    //               borderRadius: 8,
    //             }}
    //             keyboardType="phone-pad"
    //             placeholder={USER?.phone}
    //             // value={USER?.phone}
    //           />
    //           <TouchableOpacity
    //             style={{
    //               backgroundColor: Gold,
    //               height: 50,
    //               borderRadius: 8,
    //               display: 'flex',
    //               justifyContent: 'center',
    //               alignItems: 'center',
    //               marginTop: 30,
    //             }}>
    //             <Text style={{color: White, fontWeight: '500'}}>Update</Text>
    //           </TouchableOpacity>
    // </View>



    <SafeAreaView style={{paddingHorizontal: 20, flex: 1, backgroundColor: Black}}>
      {isLoading && <Loader />}
      <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: 20}}>
        <TouchableOpacity onPress={() => navigation.goBack()} >
          <Ionicons name="chevron-back" size={20} color={Gold} />
        </TouchableOpacity>
      <Text style={{color: Gold, fontSize: 20, fontWeight: '500'}}>Profile</Text>
      </View>
      <View style={{display: 'flex', alignItems: 'center', marginTop: 40}}>
        <TouchableOpacity onPress={handleImageUpload}>
          {data.profilePhoto ? (
            <Image 
              source={{ uri: `https://t1wfswdh-3000.inc1.devtunnels.ms/${data.profilePhoto}` }} 
              style={{width: 100, height: 100, borderRadius: 50}} 
            />
          ) : (
            <Image 
              source={require('..//assets/images/user.png')} 
              style={{width: 100, height: 100, borderRadius: 50}}
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
      <Text style={{color: White, fontSize: 20, textAlign: 'center', marginTop: 15, fontWeight: '500'}}>{user?.firstName + " " + user?.lastName}</Text>
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
        value={data.firstName}
        onChangeText={text => handledata('firstName', text)}
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
        value={data.lastName}
        onChangeText={text => handledata('lastName', text)}
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
        value={data.email}
        keyboardType="email-address"
        placeholder="Enter your email"
        onChangeText={text => handledata('email', text)}
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
          color: White
        }}
        keyboardType="phone-pad"
        placeholder="Enter your mobile number"
        value={user?.phone}
        editable={false}
      />
      <TouchableOpacity
        style={{
          backgroundColor: buttonDisabled ? Gray : Gold,
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
        <Text style={{color: White, fontWeight: '500'}}>
          {updateProfileMutation.isPending ? 'Updating...' : 'Update'}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  )
}