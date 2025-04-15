import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';

const UserCard = ({ user, onPress, getInitials, getRandomColor }) => {
  const initials = getInitials(user.fullname);
  const backgroundColor = getRandomColor(user.fullname);

  return (
    <TouchableOpacity style={styles.userCard} onPress={() => onPress(user)}>
      <View style={[styles.avatar, { backgroundColor }]}>
        {user.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
        ) : (
          <Text style={styles.avatarText}>{initials}</Text>
        )}
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{user.fullname}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
});

export default UserCard;
