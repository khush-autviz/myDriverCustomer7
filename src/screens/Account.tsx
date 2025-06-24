import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView, ActivityIndicator } from 'react-native'
import React, { useState, useEffect, useCallback } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Black, DarkGray, Gold, Gray, LightGold, White } from '../constants/Color'
import Ionicons from 'react-native-vector-icons/Ionicons'
import { useAuthStore } from '../store/authStore'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { useQuery } from '@tanstack/react-query'
import { getWalletBalance } from '../constants/Api'

export default function Account() {
  var USER = useAuthStore(state => state.user)
  const LOGOUT = useAuthStore(state => state.logout)
  const navigation: any = useNavigation()
  const [walletBalance, setWalletBalance] = useState(0)

  // Fetch wallet balance
  const { 
    data: walletData, 
    isLoading: walletLoading, 
    error: walletError ,
    refetch: refetchWalletBalance
  } = useQuery({
    queryKey: ['wallet-balance'],
    queryFn: getWalletBalance,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0, // Always consider data stale to allow refetching
  });

  useEffect(() => {
    console.log('Wallet data updated:', walletData?.data?.data?.balance);
    if (walletData?.data?.data?.balance !== undefined) {
      setWalletBalance(walletData.data.data.balance);
    }
  }, [walletData]);

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `$${numAmount.toFixed(2)}`;
  };

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{name: 'Signin'}],
    });
    LOGOUT()
  }

  // Menu items with icons, labels, and navigation targets
  const menuItems = [
    {
      icon: 'person',
      label: 'Manage Profile',
      onPress: () => navigation.navigate('Profile'),
      important: true
    },
    {
      icon: 'card',
      label: 'Transaction History',
      onPress: () => navigation.navigate('TransactionHistory'),
      important: true
    },
    // {
    //   icon: 'settings',
    //   label: 'Settings',
    //   onPress: () => {},
    //   important: true
    // },
    // {
    //   icon: 'chatbubbles',
    //   label: 'Messages',
    //   onPress: () => {},
    //   important: true,
    //   badge: true,
    //   badgeCount: 3
    // },
    // {
    //   icon: 'flame',
    //   label: 'Points & Rewards',
    //   onPress: () => {},
    //   important: true,
    //   highlight: true,
    //   points: '2,450'
    // },
    // {
    //   icon: 'server',
    //   label: 'Saved Locations',
    //   onPress: () => {},
    //   important: true
    // },
    {
      icon: 'log-out',
      label: 'Logout',
      onPress: handleLogout,
      important: true,
      danger: true
    }
  ]

  useFocusEffect(
    useCallback(() => {
      console.log('Account screen focused - refetching wallet balance');
      refetchWalletBalance()
    }, [refetchWalletBalance])
  )

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            {/* {USER?.profileImage ? (
              <Image 
                source={{ uri: `http://3.110.180.116:3000/${USER.profileImage}` }} 
                style={styles.profileImage} 
              />
            ) : ( */}
              <View style={styles.profileImagePlaceholder}>
                <Text style={styles.profileInitials}>
                  {USER?.firstName?.charAt(0) || ''}{USER?.lastName?.charAt(0) || ''}
                </Text>
              </View>
            {/* )} */}
            <View style={styles.profileBadge}>
              <Ionicons name="checkmark-circle" size={20} color={Gold} />
            </View>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{USER?.firstName} {USER?.lastName}</Text>
            <Text style={styles.profileEmail}>{USER?.email || 'No email provided'}</Text>
            {/* <TouchableOpacity 
              style={styles.editProfileButton}
              onPress={() => navigation.navigate('Profile')}
            >
              <Ionicons name="create-outline" size={14} color={Gold} />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity> */}
          </View>
        </View>

        {/* Wallet Card */}
        <View style={styles.walletCard}>
          <View style={styles.walletHeader}>
            <View style={styles.walletIconContainer}>
              <Ionicons name="wallet-outline" size={20} color={Gold} />
            </View>
            <Text style={styles.walletLabel}>Wallet Balance</Text>
          </View>
          <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
          <View style={styles.walletBalanceContainer}>
            {walletLoading ? (
              <ActivityIndicator size="small" color={Gold} />
            ) : walletError ? (
              <Text style={styles.walletErrorText}>Failed to load</Text>
            ) : (
              <Text style={styles.walletBalance}>{formatCurrency(walletBalance)}</Text>
            )}
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('WalletRecharge')}>
            <Ionicons name="add-circle-outline" size={24} color={Gold} />
          </TouchableOpacity>
          </View>
        </View>

        {/* Invite Card */}
        {/* <View style={styles.inviteCard}>
          <View style={styles.inviteContent}>
            <Ionicons name="gift-outline" size={28} color={Black} style={styles.inviteIcon} />
            <View>
              <Text style={styles.inviteTitle}>Invite friends!</Text>
              <Text style={styles.inviteSubtitle}>Invite your friends to earn free points for later use</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.inviteButton}>
            <Text style={styles.inviteButtonText}>Share</Text>
            <Ionicons name="share-social-outline" size={16} color={White} />
          </TouchableOpacity>
        </View> */}

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          <Text style={styles.menuSectionTitle}>Account Settings</Text>
          
          {menuItems.filter(item => item.important).map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={[
                styles.menuItem, 
                item.danger && styles.dangerMenuItem
              ]}
              onPress={item.onPress}
            >
              <View style={[
                styles.menuIconContainer,
                // item.highlight && styles.highlightedIcon,
                item.danger && styles.dangerIcon
              ]}>
                <Ionicons 
                  name={item.icon} 
                  size={20} 
                  color={item.danger ? '#FF6B6B' : Gold} 
                />
              </View>
              
              <View style={styles.menuTextContainer}>
                <Text style={[
                  styles.menuLabel, 
                  item.danger && styles.dangerMenuLabel
                ]}>
                  {item.label}
                </Text>
              </View>            
              {/* {item?.badge && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{item?.badgeCount ?? 0}</Text>
                </View>
              )}
              
              {!item?.badge && !item.danger && (
                <Ionicons name="chevron-forward" size={18} color={Gray} />
              )} */}
            </TouchableOpacity>
          ))}
        </View>

        {/* App Info */}
        <View style={styles.appInfoContainer}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
        </View> 
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 20,
    paddingTop: 10,
  },
  headerTitle: {
    color: LightGold,
    fontSize: 28,
    fontWeight: '800',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    marginRight: 16,
    position: 'relative',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: Gold,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Gold,
  },
  profileInitials: {
    color: Gold,
    fontSize: 28,
    fontWeight: '700',
  },
  profileBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: Black,
    borderRadius: 10,
    padding: 2,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: White,
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  profileEmail: {
    color: Gray,
    fontSize: 14,
    marginBottom: 10,
  },
  editProfileButton: {
    backgroundColor: 'transparent',
    paddingVertical: 6,
    paddingHorizontal: 0,
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editProfileText: {
    color: Gold,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  inviteCard: {
    backgroundColor: '#fce5fc',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inviteContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inviteIcon: {
    marginRight: 12,
  },
  inviteTitle: {
    color: Black,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  inviteSubtitle: {
    color: DarkGray,
    fontSize: 14,
    width: '90%',
  },
  inviteButton: {
    backgroundColor: Gold,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  inviteButtonText: {
    color: White,
    fontWeight: '600',
    marginRight: 6,
  },
  menuContainer: {
    marginBottom: 24,
  },
  menuSectionTitle: {
    color: LightGold,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dangerMenuItem: {
    marginTop: 16,
    borderBottomWidth: 0,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  highlightedIcon: {
    backgroundColor: Gold,
  },
  dangerIcon: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
  },
  dangerMenuLabel: {
    color: '#FF6B6B',
  },
  pointsText: {
    color: Gold,
    fontSize: 14,
    marginTop: 4,
  },
  badgeContainer: {
    backgroundColor: Gold,
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  badgeText: {
    color: Black,
    fontSize: 12,
    fontWeight: '700',
  },
  appInfoContainer: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  versionText: {
    color: Gray,
    fontSize: 12,
    marginBottom: 10,
  },
  appInfoLinks: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appInfoLink: {
    color: Gold,
    fontSize: 14,
  },
  appInfoDot: {
    color: Gray,
    marginHorizontal: 8,
  },
  walletCard: {
    backgroundColor: '#222',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletIconContainer: {
    marginRight: 12,
  },
  walletLabel: {
    color: LightGold,
    fontSize: 18,
    fontWeight: '600',
  },
  walletBalanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  walletErrorText: {
    color: '#FF6B6B',
    fontSize: 14,
  },
  walletBalance: {
    color: Gold,
    fontSize: 18,
    fontWeight: '700',
  },
  // walletButton: {
  //   backgroundColor: Gold,
  //   borderRadius: 16,
  //   padding: 16,
  //   marginBottom: 24,
  // },
})