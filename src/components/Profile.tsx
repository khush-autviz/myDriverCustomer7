import { View, Text, Image, TouchableOpacity, TextInput, Platform, ActivityIndicator, ScrollView, KeyboardAvoidingView, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Black, Gold, Gray, White, LightGold, Maroon } from '../constants/Color'
import { useAuthStore } from '../store/authStore'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import { useMutation, useQuery } from '@tanstack/react-query'
import { launchImageLibrary, ImageLibraryOptions } from 'react-native-image-picker'
import { editProfile, getProfile, deleteAccount } from '../constants/Api'
import { ShowToast } from '../lib/Toast'
import Loader from './Loader'


export default function Profile() {
  // const USER = useAuthStore(state => state.user)
  const [buttonDisabled, setbuttonDisabled] = useState(true)
  const { user, setUser , setToken} = useAuthStore()
  const navigation: any = useNavigation()
  const [data, setdata] = useState<any>({
    firstName: '',
    lastName: '',
    email: '',
    // profileImage: null
  })
  const [showDeleteModal, setShowDeleteModal] = useState(false)


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
    // if (data.profileImage && !data.profileImage.startsWith('http')) {
    //   const photoName = data.profileImage.split('/').pop() || 'profile.jpg'
    //   const photoType = photoName.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'

    //   const photoFile = {
    //     uri: Platform.OS === 'android' ? data.profileImage : data.profileImage.replace('file://', ''),
    //     type: photoType,
    //     name: photoName,
    //   }
    //   formData.append('profileImage', photoFile as any)

    //   // Log the photo file details separately
    //   console.log('Photo file details:', {
    //     uri: photoFile.uri,
    //     type: photoType,
    //     name: photoName
    //   })
    // }

    // Log form data contents
    console.log('Form data being sent:', formData)

    updateProfileMutation.mutateAsync(formData)
  }

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: (response) => {
      console.log('Account deleted successfully', response);
      setShowDeleteModal(false);
      ShowToast('Account deleted successfully', { type: 'success' });
      setUser({} as any)
      setToken({} as any)
       navigation.reset({
         index: 0,
         routes: [{ name: 'Signin' }],
       });
    
    },
    onError: (error: any) => {
      console.error('Delete account error:', error);
      ShowToast(error?.response?.data?.message || error?.message || 'Failed to delete account', { type: 'error' });
    }
  });

  const confirmDeleteAccount = () => {
    // Call the delete account API with phone number
    if (user?.phone) {
      deleteAccountMutation.mutateAsync({ phone: user.phone });
    } else {
      ShowToast('Phone number not found', { type: 'error' });
    }
  };


  useEffect(() => {
    if (UserDetails) {

      console.log('UserDetails', UserDetails)

      setdata({
        firstName: UserDetails?.data?.data?.firstName,
        lastName: UserDetails?.data?.data?.lastName,
        email: UserDetails?.data?.data?.email,
        // profileImage: UserDetails?.data?.data?.profileImage,
      })
    }

  }, [UserDetails]);

  // handle delete account
  const handleDeleteAccount = () => {
    setShowDeleteModal(true)
  }


  console.log('profile image', data.profileImage);
  


  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1, backgroundColor: Black}}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
    <SafeAreaView style={styles.container}>
      {isLoading && <Loader />}
      
      {/* Custom Delete Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: 'rgba(26, 26, 26, 0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 20,
        }}>
          <View style={{
            backgroundColor: Black,
            borderRadius: 20,
            padding: 30,
            width: '100%',
            maxWidth: 350,
            borderWidth: 2,
            borderColor: Gold,
            // shadowColor: Gold,
            // shadowOffset: { width: 0, height: 8 },
            // shadowOpacity: 0.3,
            // shadowRadius: 16,
            // elevation: 8,
          }}>
            {/* Warning Icon */}
            <View style={{
              alignSelf: 'center',
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: 'rgba(139, 58, 58, 0.1)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 20,
            }}>
              <Ionicons name="warning" size={30} color={Maroon} />
            </View>

            {/* Title */}
            <Text style={{
              fontSize: 24,
              fontWeight: 'bold',
              color: White,
              textAlign: 'center',
              marginBottom: 15,
            }}>
              Delete Account
            </Text>

            {/* Message */}
            <Text style={{
              fontSize: 16,
              color: Gray,
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 30,
            }}>
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.
            </Text>

            {/* Action Buttons */}
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              gap: 15,
            }}>
              {/* Cancel Button */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  borderWidth: 2,
                  borderColor: Gray,
                  borderRadius: 12,
                  paddingVertical: 15,
                  alignItems: 'center',
                }}
                onPress={() => setShowDeleteModal(false)}
                disabled={deleteAccountMutation.isPending}
              >
                <Text style={{
                  fontSize: 16,
                  fontWeight: '600',
                  color: Gray,
                }}>
                  Cancel
                </Text>
              </TouchableOpacity>

              {/* Delete Button */}
              <TouchableOpacity
                style={{
                  flex: 1,
                  backgroundColor: deleteAccountMutation.isPending ? 'rgba(139, 58, 58, 0.6)' : Maroon,
                  borderRadius: 12,
                  paddingVertical: 15,
                  alignItems: 'center',
                  shadowColor: Maroon,
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                  elevation: 4,
                }}
                onPress={confirmDeleteAccount}
                disabled={deleteAccountMutation.isPending}
              >
                {deleteAccountMutation.isPending ? (
                  <ActivityIndicator size="small" color={White} />
                ) : (
                  <Text style={{
                    fontSize: 16,
                    fontWeight: '600',
                    color: White,
                  }}>
                    Delete
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={Gold} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Profile Image Section */}
          {/* <View style={styles.profileImageSection}>
            <TouchableOpacity onPress={handleImageUpload}>
              {data.profileImage ? (
                <Image
                  source={{ uri: `http://3.110.180.116:3000/${data.profileImage}` }} 
                  style={styles.profileImage}
                />
              ) : (
                <Image
                  source={require('..//assets/images/user.png')}
                  style={styles.profileImage}
                />
              )}
              <View style={styles.cameraIcon}>
                <Ionicons name="camera" size={20} color={White} />
              </View>
            </TouchableOpacity>
            <Text style={styles.profileName}>{user?.firstName + " " + user?.lastName}</Text>
          </View> */}

          {/* Form Fields */}
          <View style={styles.formSection}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="name-phone-pad"
                placeholder="Enter your first name"
                placeholderTextColor={Gray}
                value={data.firstName}
                onChangeText={text => handledata('firstName', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="name-phone-pad"
                placeholder="Enter your last name"
                placeholderTextColor={Gray}
                value={data.lastName}
                onChangeText={text => handledata('lastName', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="email-address"
                placeholder="Enter your email"
                placeholderTextColor={Gray}
                value={data.email}
                onChangeText={text => handledata('email', text)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput
                style={[styles.textInput, styles.disabledInput]}
                keyboardType="phone-pad"
                placeholder="Enter your mobile number"
                placeholderTextColor={Gray}
                value={user?.phone}
                editable={false}
              />
            </View>
          </View>
        </View>

        {/* Bottom Action Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.updateButton,
              buttonDisabled && styles.updateButtonDisabled,
            ]}
            disabled={buttonDisabled || updateProfileMutation.isPending}
            onPress={handleUpdate}
          >
            {updateProfileMutation.isPending ? (
              <ActivityIndicator size="small" color={Black} />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={Black} />
                <Text style={styles.updateButtonText}>Update Profile</Text>
              </>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={handleDeleteAccount}
          >
            <Text style={styles.deleteButtonText}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
    </KeyboardAvoidingView>
  )
}

const styles = {
  container: {
    flex: 1,
    backgroundColor: Black,
  },
  header: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    // justifyContent: 'space-between' as const,
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
  },
  headerTitle: {
    color: Gold,
    fontSize: 20,
    fontWeight: '700' as const,
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  profileImageSection: {
    alignItems: 'center' as const,
    marginBottom: 32,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  cameraIcon: {
    position: 'absolute' as const,
    bottom: 0,
    right: 0,
    backgroundColor: Gold,
    borderRadius: 15,
    padding: 5,
  },
  profileName: {
    color: White,
    fontSize: 20,
    textAlign: 'center' as const,
    marginTop: 15,
    fontWeight: '500' as const,
  },
  formSection: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: LightGold,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: White,
    fontSize: 16,
  },
  disabledInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    color: Gray,
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  updateButton: {
    backgroundColor: Gold,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    shadowColor: Gold,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  updateButtonDisabled: {
    // backgroundColor: 'rgba(212, 175, 55, 0.3)',
    // shadowOpacity: 0.1,
  },
  updateButtonText: {
    color: Black,
    fontSize: 18,
    fontWeight: '700' as const,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: Maroon,
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 10,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    marginBottom: 10,
  },
  deleteButtonText: {
    color: White,
    fontSize: 18,
    fontWeight: '700' as const,
  },
}