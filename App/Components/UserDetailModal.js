import React from 'react';
import {
  View, Text, Image, ScrollView,
  TouchableOpacity, Modal, StyleSheet, ActivityIndicator
} from 'react-native';

const UserDetailModal = ({
  visible, user, onClose, onDelete, deleteLoading,
  getInitials, getRandomColor
}) => {
  const renderAvatar = () => {
    if (!user) return null;

    if (user.avatar) {
      return <Image source={{ uri: user.avatar }} style={styles.modalAvatar} />;
    }

    const initials = getInitials(user.fullname);
    const backgroundColor = getRandomColor(user.fullname);
    return (
      <View style={[styles.modalAvatarPlaceholder, { backgroundColor }]}>
        <Text style={styles.modalAvatarText}>{initials}</Text>
      </View>
    );
  };

  const renderDetail = (label, value) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}:</Text>
      <Text style={styles.detailValue}>{value || ''}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalHeader}>User Details</Text>
          <View style={styles.avatarContainer}>{renderAvatar()}</View>
          <ScrollView contentContainerStyle={styles.detailsContainer}>
            {user && (
              <>
                {renderDetail('Role', user.role)}
                {renderDetail('Id', user._id)}
                {renderDetail('Full Name', user.fullname)}
                {renderDetail('Email', user.email)}
                {renderDetail('Created At', user.createdAt)}
                {renderDetail('Updated At', user.updatedAt)}
                {user.phoneNumber && renderDetail('Phone Number', user.phoneNumber)}
                {user.address && renderDetail('Address', user.address)}
              </>
            )}
            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteButton} onPress={onDelete} disabled={deleteLoading}>
                {deleteLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.deleteButtonText}>Delete User</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    fontSize: 25,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginVertical: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  modalAvatar: {
    width: 120,
    height: 120,
    borderRadius: 80,
    marginVertical: 20,
  },
  modalAvatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
  },
  modalAvatarText: {
    color: 'white',
    fontSize: 35,
    fontWeight: 'bold',
    letterSpacing: 4,
  },
  detailsContainer: {
    paddingHorizontal: 25,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    flex: 1,
    fontSize: 18,
    fontWeight: '500',
    color: '#555',
  },
  detailValue: {
    flex: 2,
    fontSize: 18,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: 'black',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    flex: 1,
    marginLeft: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default UserDetailModal;
