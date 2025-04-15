import React from 'react';
import { View, Text, Modal, ScrollView, TouchableOpacity, Image, ActivityIndicator, StyleSheet } from 'react-native';
import { getInitials, getRandomColor } from '../utils/Methods';

const GuideDetailModal = ({
  visible,
  onClose,
  guide,
  onEditPress,
  onDeletePress,
  deleteLoading,
}) => {

  const renderAvatar = () => {
    if (guide?.avatar) {
      return <Image source={{ uri: guide.avatar }} style={styles.avatar} />;
    } else {
      return (
        <View style={[styles.avatar, { backgroundColor: getRandomColor(guide?.fullname) }]}>
          <Text style={styles.avatarText}>{getInitials(guide?.fullname)}</Text>
        </View>
      );
    }
  };

  const renderDetail = (label, value) => (
    <View style={styles.detailRow}>
      <Text style={styles.label}>{label}:</Text>
      <Text style={styles.value}>{value || 'N/A'}</Text>
    </View>
  );

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Guide Details</Text>
          {renderAvatar()}

          <ScrollView>
            {renderDetail('Name', guide?.fullname)}
            {renderDetail('Email', guide?.email)}
            {renderDetail('Phone', guide?.phoneNumber)}
            {renderDetail('Address', guide?.address)}
            {renderDetail('Experience', guide?.experience)}
            {renderDetail('Languages', guide?.language)}
            {renderDetail('Trek Count', guide?.trekCount)}
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.editBtn} onPress={onEditPress}>
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={onDeletePress} disabled={deleteLoading}>
              {deleteLoading ? <ActivityIndicator color="white" /> : <Text style={styles.deleteText}>Delete</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GuideDetailModal;

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    maxHeight: '85%',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 60,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 30,
  },
  detailRow: {
    flexDirection: 'row',
    marginVertical: 6,
  },
  label: {
    fontWeight: 'bold',
    color: '#555',
    width: 100,
  },
  value: {
    color: '#333',
    flex: 1,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  closeBtn: {
    backgroundColor: '#333',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  editBtn: {
    backgroundColor: '#3498db',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  deleteBtn: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  closeText: { color: 'white', textAlign: 'center' },
  editText: { color: 'white', textAlign: 'center' },
  deleteText: { color: 'white', textAlign: 'center' },
});
