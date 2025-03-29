import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { BarChart } from 'react-native-chart-kit';

export default function Inventory() {
  const navigation = useNavigation();
  const [submittedData, setSubmittedData] = useState([]);

  useEffect(() => { loadSubmittedData(); }, []);

  const loadSubmittedData = async () => {
    const storedData = await AsyncStorage.getItem('submittedData');
    if (storedData) setSubmittedData(JSON.parse(storedData));
  };

  // Group products and calculate total quantity & value
  const inventoryData = submittedData.reduce((acc, item) => {
    if (!acc[item.name]) {
      acc[item.name] = { quantity: 0, price: 0 };
    }
    acc[item.name].quantity += parseFloat(item.quantity);
    acc[item.name].price += parseFloat(item.price);
    return acc;
  }, {});

  const inventoryList = Object.keys(inventoryData).map((key) => ({
    name: key,
    quantity: inventoryData[key].quantity,
    pricePerUnit: inventoryData[key].price / inventoryData[key].quantity,
    totalPrice: inventoryData[key].price,
  }));

  // Chart Data: Dynamic based on submitted products
  const chartLabels = inventoryList.map(item => item.name);
  const chartData = inventoryList.map(item => item.quantity);

  return (
    <LinearGradient colors={['#A9D6E5', '#AED9E0', '#2A6F97']} style={styles.container}>
      <Text style={styles.header}>Inventory Overview</Text>

      {/* Bar Chart */}
      {chartData.length > 0 ? (
        <BarChart
          data={{
            labels: chartLabels,
            datasets: [{ data: chartData }]
          }}
          width={350}
          height={200}
          yAxisSuffix="Kg"
          fromZero={true}
          chartConfig={{
            backgroundColor: '#2A6F97',
            backgroundGradientFrom: '#A9D6E5',
            backgroundGradientTo: '#AED9E0',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
          }}
          verticalLabelRotation={30}
          yLabelsOffset={10}
          yAxisLabel=""
          fromZero
          segments={4} // 0, 25, 50, 75, 100
        />
      ) : (
        <Text style={styles.noData}>No data available</Text>
      )}

      {/* Inventory List (Side-by-Side Cards) */}
      <ScrollView contentContainerStyle={styles.gridContainer}>
        {inventoryList.map((item, index) => (
          <View key={index} style={styles.card}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDetail}>Quantity: {item.quantity} Kg</Text>
            <Text style={styles.itemDetail}>Price (per unit): ₹{item.pricePerUnit.toFixed(2)}</Text>
            <Text style={styles.totalPrice}>₹{item.totalPrice}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Back</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center' },
  header: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  noData: { fontSize: 16, color: '#333', marginVertical: 10 },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    marginTop: 10
  },
  card: {
    backgroundColor: '#6dc2d6',
    padding: 15,
    borderRadius: 10,
    width: '45%',  // Two cards in a row
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5
  },
  itemName: { fontSize: 18, fontWeight: 'bold', color: '#1B3A57' },
  itemDetail: { fontSize: 14, color: '#333' },
  totalPrice: { fontSize: 18, fontWeight: 'bold', color: '#E63946', marginTop: 5 },
  backButton: {
    backgroundColor: '#05668d',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 20,
    width: '50%'
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
