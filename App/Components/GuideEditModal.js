import React from 'react';
import { View, Text, Modal, TextInput, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

const GuideEditModal = ({
  visible,
  onClose,
  guide,
  experience,
  language,
  trekCount,
  setExperience,
  setLanguage,
  setTrekCount,
  onUpdateGuide,
  updateLoading,
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Edit Guide Details</Text>

          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.guideName}>Guide: {guide?.fullname}</Text>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Experience:</Text>
              <TextInput
                placeholder="e.g. 5 years"
                style={styles.input}
                value={experience}
                onChangeText={setExperience}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Languages:</Text>
              <TextInput
                placeholder="e.g. English, Nepali"
                style={styles.input}
                value={language}
                onChangeText={setLanguage}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Trek Count:</Text>
              <TextInput
                placeholder="e.g. 10"
                keyboardType="numeric"
                style={styles.input}
                value={trekCount}
                onChangeText={setTrekCount}
              />
            </View>
          </ScrollView>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveBtn} onPress={onUpdateGuide} disabled={updateLoading}>
              {updateLoading ? <ActivityIndicator color="white" /> : <Text style={styles.saveText}>Save</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default GuideEditModal;

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
  guideName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: '#f5f5f5',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  cancelBtn: {
    backgroundColor: '#555',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 5,
  },
  saveBtn: {
    backgroundColor: '#2ecc71',
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 5,
  },
  cancelText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
  saveText: { color: 'white', textAlign: 'center', fontWeight: 'bold' },
});
