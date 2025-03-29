import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Keyboard } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const productsData = {
  Dairy: [{ name: 'Milk', pricePerKg: 20 }, { name: 'Curd', pricePerKg: 25 }],
  Fruits: [{ name: 'Apple', pricePerKg: 100 }, { name: 'Banana', pricePerKg: 30 }],
};

export default function AddProduct({ navigation }) {
  const [categoryQuery, setCategoryQuery] = useState('');
  const [productQuery, setProductQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [purchaseList, setPurchaseList] = useState([]);
  const [editIndex, setEditIndex] = useState(-1);

  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [showProductSuggestions, setShowProductSuggestions] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    const data = await AsyncStorage.getItem('purchases');
    if (data) setPurchaseList(JSON.parse(data));
  };

  const saveData = async (list) => {
    await AsyncStorage.setItem('purchases', JSON.stringify(list));
  };

  const calculatePrice = (qty, product) => {
    if (product && qty) setPrice(qty * product.pricePerKg);
    else setPrice('');
  };

  const handleAddOrUpdate = () => {
    if (selectedProduct && quantity && price) {
      const item = { ...selectedProduct, quantity, price };
      let updatedList = [...purchaseList];
      if (editIndex >= 0) {
        updatedList[editIndex] = item;
        setEditIndex(-1);
      } else {
        updatedList.push(item);
      }
      setPurchaseList(updatedList);
      saveData(updatedList);
      resetFields();
    }
  };

  const resetFields = () => {
    setProductQuery('');
    setSelectedProduct(null);
    setQuantity('');
    setPrice('');
    Keyboard.dismiss();
  };

  const handleEdit = (index) => {
    const item = purchaseList[index];
    setProductQuery(item.name);
    setSelectedProduct(item);
    setQuantity(item.quantity.toString());
    setPrice(item.price.toString());
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const updatedList = [...purchaseList];
    updatedList.splice(index, 1);
    setPurchaseList(updatedList);
    saveData(updatedList);
  };

  const handleSubmit = async () => {
    const previousData = await AsyncStorage.getItem('submittedData');
    let parsedData = previousData ? JSON.parse(previousData) : [];
    parsedData = [...parsedData, ...purchaseList];
    await AsyncStorage.setItem('submittedData', JSON.stringify(parsedData));
    setPurchaseList([]);
    await AsyncStorage.removeItem('purchases');
    navigation.navigate('List');
  };

  const allCategories = Object.keys(productsData);
  const filteredCategories = categoryQuery.length > 0
    ? allCategories.filter(c => c.toLowerCase().includes(categoryQuery.toLowerCase()))
    : allCategories;

  const filteredProducts = selectedCategory
    ? productsData[selectedCategory].filter(p =>
      p.name.toLowerCase().includes(productQuery.toLowerCase())
    )
    : [];

  return (
    <LinearGradient colors={['#A9D6E5', '#AED9E0', '#2A6F97']} style={styles.container}>
      <Text style={styles.heading}>Add Purchased Products</Text>

      <Text>Search Category</Text>
      <TextInput
        style={styles.input}
        value={categoryQuery}
        onChangeText={(text) => {
          setCategoryQuery(text);
          setShowCategorySuggestions(true);
          setSelectedCategory(null);
          setSelectedProduct(null);
          setProductQuery('');
        }}
        placeholder="Start typing category name"
      />
      {showCategorySuggestions && (
        <FlatList
          data={filteredCategories}
          keyExtractor={(item, index) => index.toString()}
          style={styles.suggestionBox}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => {
                setCategoryQuery(item);
                setSelectedCategory(item);
                setShowCategorySuggestions(false);
              }}>
              <Text style={styles.suggestion}>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {selectedCategory && (
        <>
          <Text>Search Product</Text>
          <TextInput
            style={styles.input}
            value={productQuery}
            onChangeText={(text) => {
              setProductQuery(text);
              setShowProductSuggestions(true);
            }}
            placeholder="Start typing product name"
          />
          {showProductSuggestions && (
            <FlatList
              data={filteredProducts}
              keyExtractor={(item, index) => index.toString()}
              style={styles.suggestionBox}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setProductQuery(item.name);
                    setSelectedProduct(item);
                    setShowProductSuggestions(false);
                    calculatePrice(quantity, item);
                  }}>
                  <Text style={styles.suggestion}>{item.name}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          <Text>Quantity (kg)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={quantity}
            onChangeText={(qty) => {
              setQuantity(qty);
              calculatePrice(qty, selectedProduct);
            }}
            placeholder="Enter quantity"
          />

          <Text>Total Price: ₹{price}</Text>

          <TouchableOpacity style={styles.addButton} onPress={handleAddOrUpdate}>
            <Text style={styles.addButtonText}>{editIndex >= 0 ? 'Update' : 'Add'}</Text>
          </TouchableOpacity>
        </>
      )}

      <Text style={styles.heading}>Purchase List</Text>
      <FlatList
        data={purchaseList}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text>Product: {item.name}</Text>
            <Text>Quantity: {item.quantity} kg</Text>
            <Text>Price: ₹{item.price}</Text>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(index)}>
                <Text style={styles.buttonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(index)}>
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      {purchaseList.length > 0 && (
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.addButtonText}>Submit</Text>
        </TouchableOpacity>
      )} {/* NEW BUTTON TO NAVIGATE TO INVENTORY PAGE */}
 <TouchableOpacity style={styles.inventoryButton} onPress={() => navigation.navigate('Inventory')}>
        <Text style={styles.buttonText}>View Inventory</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  heading: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#fff' },
  input: { backgroundColor: '#fff', padding: 10, borderRadius: 8, marginVertical: 10 },
  suggestionBox: { backgroundColor: '#fff', maxHeight: 120 },
  suggestion: { padding: 10, borderBottomWidth: 1, borderColor: '#ccc' },
  addButton: { backgroundColor: '#2A6F97', padding: 15, borderRadius: 10, alignItems: 'center', marginVertical: 10 },
  addButtonText: { color: '#fff', fontWeight: 'bold' },
  card: { backgroundColor: '#AED9E0', padding: 15, borderRadius: 15, marginBottom: 10 },
  cardActions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  editButton: { backgroundColor: '#00B383', padding: 10, borderRadius: 8 },
  deleteButton: { backgroundColor: '#D00000', padding: 10, borderRadius: 8 },
  buttonText: { color: '#fff' },
  submitButton: { backgroundColor: '#2A6F97', padding: 15, borderRadius: 10, alignItems: 'center' },
  inventoryButton: {
    backgroundColor: '#05668d',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10
  },
});
