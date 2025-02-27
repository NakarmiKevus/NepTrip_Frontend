import React, { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { SearchBar } from '../Components/SearchBar';
import { TrekCard } from '../Components/TrekCard';


const categories = [
  { id: '1', name: 'New' },
  { id: '2', name: 'Popular' },
  { id: '3', name: 'Recommended' },
];

const treks = [
  {
    id: '1',
    name: 'Everest Base Camp',
    difficulty: 'Hard',
    distance: '103.3km',
    location: 'Sagarmatha National Park',
    image: 'https://example.com/everest.jpg',
  },
  {
    id: '2',
    name: 'Annapurna Base Camp',
    difficulty: 'Moderate',
    distance: '95km',
    location: 'Annapurna Conservation Area',
    image: 'https://example.com/annapurna.jpg',
  },
];

const CategoryFilter = ({ categories, selectedCategory, onSelectCategory }) => {
  return (
    <View style={styles.filterContainer}>
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={[
            styles.categoryItem,
            selectedCategory === category.id && styles.activeCategory,
          ]}
          onPress={() => onSelectCategory(category.id)}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === category.id && styles.activeCategoryText,
            ]}
          >
            {category.name}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const Dashboard = () => { 
  const [selectedCategory, setSelectedCategory] = useState(categories[0].id); // Add state for selectedCategory

  return (
    <SafeAreaView style={styles.container}>
      <SearchBar />
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory} // Pass function to update state
      />
      <ScrollView style={styles.cardsContainer}>
        {treks.map((trek) => (
          <TrekCard
            key={trek.id}
            trek={trek}
            onPress={() => console.log('Trek pressed:', trek.name)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop:54,
  },
  cardsContainer: {
    flex: 1,
    padding: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 10,
    

  },
  categoryItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 5,
    borderRadius: 20,
    backgroundColor: '#ddd',
  },
  activeCategory: {
    backgroundColor: 'black',
  },
  categoryText: {
    color: 'black',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#fff',
  },
});

export default Dashboard;