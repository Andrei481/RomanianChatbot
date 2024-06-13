// import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const conversations = [
  { id: '1', title: 'Conversation 1' },
  { id: '2', title: 'Conversation 2' },
  { id: '3', title: 'Conversation 3' },
  // Add more conversations as needed
];

const SideMenu = ({ navigation, closeMenu }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => { navigation.navigate('HomeScreen'); closeMenu(); }}>
        <Text style={styles.menuItem}>User Profile</Text>
      </TouchableOpacity>
      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.conversationItem}
            onPress={() => {
              // Navigate to the conversation screen
              navigation.navigate('ConversationScreen', { conversationId: item.id });
              closeMenu();
            }}
          >
            <Text style={styles.conversationText}>{item.title}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  menuItem: {
    fontSize: 18,
    marginVertical: 10,
  },
  conversationItem: {
    backgroundColor: '#000',
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
  },
  conversationText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default SideMenu;
