import { View, Text, ActivityIndicator, StyleSheet } from 'react-native'
import React from 'react'
import { Gold } from '../constants/Color'

export default function Loader() {
  return (
    <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={Gold} />
  </View>
  )
}
const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
});