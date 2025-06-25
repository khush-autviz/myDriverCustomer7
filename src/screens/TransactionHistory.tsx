import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Black, DarkGray, Gold, Gray, LightGold, White } from '../constants/Color';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { getWalletTransactionHistory } from '../constants/Api';
import { ShowToast } from '../lib/Toast';

const { width } = Dimensions.get('window');

export default function TransactionHistory() {
  const navigation: any = useNavigation();
  const [refreshing, setRefreshing] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, credit, debit, transfer
  
  // Fetch transaction history
  const { 
    data: transactionData, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['wallet-transactions'],
    queryFn: getWalletTransactionHistory,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
  });

  useEffect(() => {
    // Update transactions when data is fetched
    if (transactionData?.data?.data?.transactions) {
      setTransactions(transactionData.data.data.transactions);
    }
  }, [transactionData]);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      // Update transactions when data is refetched
      if (transactionData?.data?.data?.transactions) {
        setTransactions(transactionData.data.data.transactions);
      }
    } catch (error) {
      ShowToast('Failed to refresh transactions', { type: 'error' });
    } finally {
      setRefreshing(false);
    }
  };

  const formatCurrency = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `R${numAmount.toFixed(2)}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'credit':
      case 'deposit':
      case 'add':
      case 'topup':
        return 'add-circle';
      case 'debit':
      case 'withdrawal':
      case 'payment':
        return 'remove-circle';
      case 'transfer':
        return 'swap-horizontal';
      default:
        return 'card';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'credit':
      case 'deposit':
      case 'add':
      case 'topup':
        return '#4CAF50';
      case 'debit':
      case 'withdrawal':
      case 'payment':
        return '#F44336';
      case 'transfer':
        return Gold;
      default:
        return Gray;
    }
  };

  const getTransactionTitle = (transaction: any) => {
    if (transaction.description) return transaction.description;
    
    switch (transaction.type?.toLowerCase()) {
      case 'credit':
      case 'deposit':
      case 'add':
      case 'topup':
        return 'Wallet Recharge';
      case 'debit':
      case 'withdrawal':
      case 'payment':
        return 'Payment';
      case 'transfer':
        return 'Transfer';
      default:
        return 'Transaction';
    }
  };

  const getFilteredTransactions = () => {
    if (filter === 'all') return transactions;
    
    return transactions.filter((transaction: any) => {
      const type = transaction.type?.toLowerCase();
      switch (filter) {
        case 'credit':
          return type === 'credit' || type === 'deposit' || type === 'add' || type === 'topup';
        case 'debit':
          return type === 'debit' || type === 'withdrawal' || type === 'payment';
        case 'transfer':
          return type === 'transfer';
        default:
          return true;
      }
    });
  };

  const getTransactionStats = () => {
    const credits = transactions.filter((t: any) => 
      t.type?.toLowerCase() === 'credit' || 
      t.type?.toLowerCase() === 'deposit' || 
      t.type?.toLowerCase() === 'add' || 
      t.type?.toLowerCase() === 'topup'
    );
    
    const debits = transactions.filter((t: any) => 
      t.type?.toLowerCase() === 'debit' || 
      t.type?.toLowerCase() === 'withdrawal' || 
      t.type?.toLowerCase() === 'payment'
    );

    const totalCredits = credits.reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0);
    const totalDebits = debits.reduce((sum: number, t: any) => sum + (parseFloat(t.amount) || 0), 0);

    return {
      totalCredits: formatCurrency(totalCredits),
      totalDebits: formatCurrency(totalDebits),
      totalTransactions: transactions.length,
    };
  };

  const renderTransactionItem = ({ item, index }: { item: any; index: number }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionIcon}>
        <Ionicons 
          name={getTransactionIcon(item.type)} 
          size={24} 
          color={getTransactionColor(item.type)} 
        />
      </View>
      
      <View style={styles.transactionContent}>
        <Text style={styles.transactionTitle}>
          {getTransactionTitle(item)}
        </Text>
        <Text style={styles.transactionDate}>
          {formatDate(item.createdAt)} • {formatTime(item.createdAt)}
        </Text>
        {item.orderId && (
          <Text style={styles.transactionOrderId}>
            Order: {item.orderId}
          </Text>
        )}
      </View>
      
      <View style={styles.transactionAmount}>
        <Text style={[
          styles.amountText,
          { color: getTransactionColor(item.type) }
        ]}>
          {item.type?.toLowerCase() === 'debit' || 
           item.type?.toLowerCase() === 'withdrawal' || 
           item.type?.toLowerCase() === 'payment' ? '-' : '+'}
          {formatCurrency(item.amount)}
        </Text>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.status === 'completed' ? 
            'rgba(76, 175, 80, 0.2)' : 
            item.status === 'pending' ? 'rgba(255, 193, 7, 0.2)' :
            'rgba(244, 67, 54, 0.2)' }
        ]}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'completed' ? '#4CAF50' : 
                     item.status === 'pending' ? '#FFC107' : '#F44336' }
          ]}>
            {item.status || 'pending'}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={64} color={Gray} />
      <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
      <Text style={styles.emptyStateSubtitle}>
        Your transaction history will appear here once you make your first payment or recharge.
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Gold} />
          <Text style={styles.loadingText}>Loading transactions...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Oops!</Text>
          <Text style={styles.errorText}>Failed to load transaction history</Text>
          <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const stats = getTransactionStats();
  const filteredTransactions = getFilteredTransactions();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={Gold} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction History</Text>
          {/* <TouchableOpacity style={styles.filterButton}>
            <Ionicons name="filter-outline" size={24} color={Gold} />
          </TouchableOpacity> */}
        </View>

        {/* Stats Cards */}
        {/* <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="trending-up" size={24} color="#4CAF50" />
            <Text style={styles.statValue}>{stats.totalCredits}</Text>
            <Text style={styles.statLabel}>Total Credits</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="trending-down" size={24} color="#F44336" />
            <Text style={styles.statValue}>{stats.totalDebits}</Text>
            <Text style={styles.statLabel}>Total Debits</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="receipt-outline" size={24} color={Gold} />
            <Text style={styles.statValue}>{stats.totalTransactions}</Text>
            <Text style={styles.statLabel}>Total Transactions</Text>
          </View>
        </View> */}

        {/* Filter Tabs */}
        {/* <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {[
              { key: 'all', label: 'All', icon: 'list' },
              { key: 'credit', label: 'Credits', icon: 'add-circle' },
              { key: 'debit', label: 'Debits', icon: 'remove-circle' },
              { key: 'transfer', label: 'Transfers', icon: 'swap-horizontal' },
            ].map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[
                  styles.filterTab,
                  filter === tab.key && styles.activeFilterTab,
                ]}
                onPress={() => setFilter(tab.key)}
              >
                <Ionicons 
                  name={tab.icon as any} 
                  size={16} 
                  color={filter === tab.key ? Black : Gold} 
                />
                <Text style={[
                  styles.filterTabText,
                  filter === tab.key && styles.activeFilterTabText,
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View> */}

        {/* Transactions List */}
        <View style={styles.transactionsContainer}>
          {/* <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {filter === 'all' ? 'All Transactions' : 
               filter === 'credit' ? 'Credit Transactions' :
               filter === 'debit' ? 'Debit Transactions' : 'Transfer Transactions'}
            </Text>
            <Text style={styles.transactionCount}>
              {filteredTransactions.length} {filteredTransactions.length === 1 ? 'transaction' : 'transactions'}
            </Text>
          </View> */}

          {filteredTransactions.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={filteredTransactions}
              renderItem={renderTransactionItem}
              keyExtractor={(item, index) => item.id || index.toString()}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
              
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Gold}  colors={[Gold]} progressBackgroundColor={Black}/>
              }
            />
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Black,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: Gray,
    fontSize: 16,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    color: White,
    fontSize: 24,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    color: Gray,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: Gold,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Black,
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 10,
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
    color: Gold,
    fontSize: 20,
    fontWeight: '700',
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  statValue: {
    color: Gold,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    color: Gray,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  filterContainer: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeFilterTab: {
    backgroundColor: Gold,
    borderColor: Gold,
  },
  filterTabText: {
    color: Gold,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  activeFilterTabText: {
    color: Black,
  },
  transactionsContainer: {
    marginHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: LightGold,
    fontSize: 18,
    fontWeight: '600',
  },
  transactionCount: {
    color: Gray,
    fontSize: 14,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  transactionContent: {
    flex: 1,
  },
  transactionTitle: {
    color: White,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionDate: {
    color: Gray,
    fontSize: 14,
    marginBottom: 2,
  },
  transactionOrderId: {
    color: Gray,
    fontSize: 12,
    fontStyle: 'italic',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateTitle: {
    color: White,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    color: Gray,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 40,
  },
});
