import { Ionicons } from '@expo/vector-icons';
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";

interface Transaction {
    id: string;
    type: 'send' | 'receive' | 'buy';
    amount: string;
    status: string;
    date: string;
}

export const HistoryComponent = () => {
    const transactions: Transaction[] = [
        { id: '1', type: 'receive', amount: '50.00 USDC', status: 'Completed', date: 'Dec 18, 2025' },
        { id: '2', type: 'send', amount: '12.50 USDC', status: 'Pending', date: 'Dec 17, 2025' },
        { id: '3', type: 'buy', amount: '100.00 USDC', status: 'Completed', date: 'Dec 15, 2025' },
    ];

    const renderItem = ({ item }: { item: Transaction }) => (
        <View style={styles.txRow}>
            <View style={[styles.iconCircle, { backgroundColor: item.type === 'receive' ? '#05b95920' : '#f0f0f0' }]}>
                <Ionicons 
                    name={item.type === 'send' ? 'arrow-up' : item.type === 'receive' ? 'arrow-down' : 'card'} 
                    size={20} 
                    color={item.type === 'receive' ? '#05b959' : '#333'} 
                />
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.txType}>{item.type.toUpperCase()}</Text>
                <Text style={styles.txDate}>{item.date}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.txAmount, { color: item.type === 'receive' ? '#05b959' : '#000' }]}>
                    {item.type === 'receive' ? '+' : '-'}{item.amount}
                </Text>
                <Text style={styles.txStatus}>{item.status}</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.historyContainer}>
            <Text style={styles.historyTitle}>Activity History</Text>
            <FlatList 
                data={transactions}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                showsVerticalScrollIndicator={false}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    historyContainer: { padding: 20, borderRadius: 15},
    historyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 20, paddingHorizontal: 16, paddingVertical: 12 },
    txRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    iconCircle: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
    txType: { fontWeight: '600', fontSize: 15 },
    txDate: { fontSize: 12, color: '#999' },
    txAmount: { fontWeight: 'bold', fontSize: 15 },
    txStatus: { fontSize: 11, color: '#666' }
});