import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Black, DarkGray, Gold, Gray, LightGold, White } from '../constants/Color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';
import { captureWalletTopup, createWalletTopup } from '../constants/Api';
import { ShowToast } from '../lib/Toast';
import { WebView } from 'react-native-webview';

export default function WalletRecharge() {
  const navigation: any = useNavigation();
  const [amount, setAmount] = useState('');
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [showWebView, setShowWebView] = useState(false);
  const [paypalUrl, setPaypalUrl] = useState('');
  const [paypalToken, setPaypalToken] = useState('');

  // Predefined amounts for quick selection
  const quickAmounts = [10, 25, 50, 100, 200, 500];

  // capture wallet topup mutation
  const captureTopupMutation = useMutation({
    mutationFn: (id: any) => captureWalletTopup(id),
    onSuccess: (response) => {
      console.log('Topup captured successfully:', response);
      ShowToast('Payment completed successfully!', { type: 'success' });
      navigation.goBack();
    },
    onError: (error: any) => {
      console.log('Topup capture failed:', error);
      ShowToast(
        error?.response?.data?.message || error?.message || 'Failed to capture payment',
        { type: 'error' }
      );
    },
  });

  // Create wallet topup order mutation
  const createTopupMutation = useMutation({
    mutationFn: createWalletTopup,
    onSuccess: (response) => {
      console.log('Topup order created successfully:', response);
      
      // Extract PayPal approval URL from response
      const approvalUrl = response?.data?.data?.approvalUrl;
      const orderId = response?.data?.data?.orderId;
      
      if (approvalUrl) {
        setPaypalUrl(approvalUrl);
        setShowWebView(true);
        ShowToast('Redirecting to PayPal...', { type: 'info' });
      } else {
        ShowToast('Payment order created but no approval URL received', { type: 'error' });
      }
    },
    onError: (error: any) => {
      console.log('Topup order creation failed:', error);
      ShowToast(
        error?.response?.data?.message || error?.message || 'Failed to create payment order',
        { type: 'error' }
      );
    },
  });

  const handleAmountChange = (text: string) => {
    // Only allow numbers and decimal point
    const cleanedText = text.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    const parts = cleanedText.split('.');
    if (parts.length > 2) return;
    
    // Limit to 2 decimal places
    if (parts[1] && parts[1].length > 2) return;
    
    setAmount(cleanedText);
    setSelectedAmount(null); // Clear selected amount when typing
  };

  const handleQuickAmountSelect = (quickAmount: number) => {
    setSelectedAmount(quickAmount);
    setAmount(quickAmount.toString());
  };

  const handleRecharge = () => {
    const numAmount = parseFloat(amount);
    
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      ShowToast('Please enter a valid amount', { type: 'error' });
      return;
    }

    if (numAmount < 1) {
      ShowToast('Minimum recharge amount is $1', { type: 'error' });
      return;
    }

    if (numAmount > 10000) {
      ShowToast('Maximum recharge amount is $10,000', { type: 'error' });
      return;
    }

    // Show confirmation dialog
    Alert.alert(
      'Confirm Recharge',
      `Are you sure you want to recharge your wallet with $${numAmount.toFixed(2)}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            createTopupMutation.mutate({ amount: numAmount });
          },
        },
      ]
    );
  };

  const formatCurrency = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return '$0.00';
    return `$${numValue.toFixed(2)}`;
  };

  const handleWebViewNavigationStateChange = (navState: any) => {
    console.log('WebView navigation state:', navState);
    
    // Handle PayPal success/cancel URLs
    const url = navState.url;
    
    // Check for PayPal success URL (you may need to adjust these based on your PayPal configuration)
    if (url.includes('/wallet/success') || url.includes('success')) {
        console.log('Payment success! Token:', url);
        const token = url.match(/token=([^&]+)/)?.[1];
        setPaypalToken(token);
        console.log('Token: paypal', token);
        captureTopupMutation.mutate(token);
      setShowWebView(false);
      ShowToast('Payment completed successfully!', { type: 'success' });
      navigation.goBack();
    }
    
    // Check for PayPal cancel URL
    if (url.includes('paypal.com/cancel') || url.includes('cancel')) {
      setShowWebView(false);
      ShowToast('Payment was cancelled', { type: 'warning' });
    }
  };

  const handleWebViewError = (error: any) => {
    console.log('WebView error:', error);
    setShowWebView(false);
    // ShowToast('Failed to load payment page', { type: 'error' });
  };

  const handleWebViewClose = () => {
    setShowWebView(false);
    ShowToast('Payment cancelled', { type: 'warning' });
  };

  // Show WebView for PayPal payment
  if (showWebView) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.webViewHeader}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleWebViewClose}
          >
            <Ionicons name="close" size={24} color={Gold} />
          </TouchableOpacity>
          <Text style={styles.webViewTitle}>PayPal Payment</Text>
          <View style={styles.placeholder} />
        </View>
        
        <WebView
          source={{ uri: paypalUrl }}
          style={styles.webView}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          onError={handleWebViewError}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color={Gold} />
              <Text style={styles.webViewLoadingText}>Loading PayPal...</Text>
            </View>
          )}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color={Gold} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Recharge Wallet</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Main Content */}
          <View style={styles.content}>
            {/* Amount Input Section */}
            <View style={styles.inputSection}>
              <Text style={styles.sectionTitle}>Enter Amount</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  value={amount}
                  onChangeText={handleAmountChange}
                  placeholder="0.00"
                  placeholderTextColor={Gray}
                  keyboardType="decimal-pad"
                  autoFocus={true}
                  maxLength={10}
                />
              </View>
              {amount && (
                <Text style={styles.amountPreview}>
                  You will be charged: {formatCurrency(amount)}
                </Text>
              )}
            </View>

            {/* Quick Amount Selection */}
            <View style={styles.quickAmountSection}>
              <Text style={styles.sectionTitle}>Quick Amounts</Text>
              <View style={styles.quickAmountGrid}>
                {quickAmounts.map((quickAmount) => (
                  <TouchableOpacity
                    key={quickAmount}
                    style={[
                      styles.quickAmountButton,
                      selectedAmount === quickAmount && styles.selectedQuickAmount,
                    ]}
                    onPress={() => handleQuickAmountSelect(quickAmount)}
                  >
                    <Text
                      style={[
                        styles.quickAmountText,
                        selectedAmount === quickAmount && styles.selectedQuickAmountText,
                      ]}
                    >
                      ${quickAmount}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Payment Method Section */}
            <View style={styles.paymentSection}>
              <Text style={styles.sectionTitle}>Payment Method</Text>
              <View style={styles.paymentMethodCard}>
                <View style={styles.paymentMethodInfo}>
                  <Ionicons name="logo-paypal" size={24} color="#0070BA" />
                  <View style={styles.paymentMethodDetails}>
                    <Text style={styles.paymentMethodName}>PayPal</Text>
                    <Text style={styles.paymentMethodDescription}>
                      Secure payment with PayPal
                    </Text>
                  </View>
                </View>
                <Ionicons name="checkmark-circle" size={24} color={Gold} />
              </View>
            </View>

            {/* Terms and Conditions */}
            <View style={styles.termsSection}>
              <Text style={styles.termsText}>
                By proceeding, you agree to our Terms of Service and Privacy Policy.
                Your payment will be processed securely through PayPal.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Action Button */}
        <View style={styles.bottomSection}>
          <TouchableOpacity
            style={[
              styles.rechargeButton,
              (!amount || parseFloat(amount) <= 0) && styles.rechargeButtonDisabled,
            ]}
            onPress={handleRecharge}
            disabled={!amount || parseFloat(amount) <= 0 || createTopupMutation.isPending}
          >
            {createTopupMutation.isPending ? (
              <ActivityIndicator size="small" color={Black} />
            ) : (
              <>
                <Ionicons name="wallet-outline" size={20} color={Black} />
                <Text style={styles.rechargeButtonText}>
                  Recharge ${amount ? formatCurrency(amount).replace('$', '') : '0.00'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: LightGold,
    fontSize: 20,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  inputSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: LightGold,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  currencySymbol: {
    color: Gold,
    fontSize: 24,
    fontWeight: '700',
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    color: White,
    fontSize: 24,
    fontWeight: '700',
    padding: 0,
  },
  amountPreview: {
    color: Gray,
    fontSize: 14,
    marginTop: 12,
    textAlign: 'center',
  },
  quickAmountSection: {
    marginBottom: 32,
  },
  quickAmountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAmountButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    minWidth: 80,
    alignItems: 'center',
  },
  selectedQuickAmount: {
    backgroundColor: Gold,
    borderColor: Gold,
  },
  quickAmountText: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
  },
  selectedQuickAmountText: {
    color: Black,
  },
  paymentSection: {
    marginBottom: 32,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodDetails: {
    marginLeft: 12,
  },
  paymentMethodName: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
  },
  paymentMethodDescription: {
    color: Gray,
    fontSize: 14,
    marginTop: 2,
  },
  termsSection: {
    marginBottom: 20,
  },
  termsText: {
    color: Gray,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  rechargeButton: {
    backgroundColor: Gold,
    borderRadius: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Gold,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  rechargeButtonDisabled: {
    // backgroundColor: 'rgba(212, 175, 55, 0.3)',
    shadowOpacity: 0.1,
  },
  rechargeButtonText: {
    color: Black,
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  // WebView styles
  webViewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  webViewTitle: {
    color: LightGold,
    fontSize: 18,
    fontWeight: '600',
  },
  webView: {
    flex: 1,
  },
  webViewLoading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Black,
  },
  webViewLoadingText: {
    color: Gray,
    fontSize: 16,
    marginTop: 16,
  },
});
