import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

export const SearchBar = ({ containerStyle, ...props }) => {
  return (
    <View style={[styles.searchContainer, containerStyle]}>
      <View style={styles.searchBar}>
        <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          placeholder="Search treks..."
          style={styles.searchInput}
          placeholderTextColor="#666"
          {...props}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 30,
    padding: 'absolute',
    paddingHorizontal: 14,
    width: '92%',
    alignSelf: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
});