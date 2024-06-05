import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flexGrow: 1,
        backgroundColor: 'black',
        justifyContent: 'center', // Centers vertically
        alignItems: 'center', // Centers horizontally
    },
    imageContainer: {
        alignItems: 'center',
        marginBottom: 10, // Adjust as needed
    },
    image: {
        width: '100%', // Adjust the width as needed
        height: 200, // Adjust the height as needed to fit one-third of the screen
        marginBottom: 5,
    },
    innerContainer: {
        padding: 5,
        width: '70%',
        justifyContent: 'center', // Centers vertically
        position: 'relative',
        alignItems: 'center', // Centers horizontally
    },
    footer: {
        marginTop: 20,
        alignItems: 'center',
    },
    footerText: {
        color: 'white',
    },
    textBoxContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 10, // Approximately 1 cm from the bottom (adjust if necessary)
        left: 0,
        right: 0,
        paddingHorizontal: 15,
        alignItems: 'center',
    },
    textBox: {
        flex: 1,
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        backgroundColor: 'white',
    },
    sendButton: {
        backgroundColor: '#007AFF',
        borderRadius: 20,
        padding: 10,
        marginLeft: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    
    userMessage: {
        alignSelf: 'flex-end', // Align user messages to the right
        backgroundColor: '#dcd7d1', // Light green background for user messages
    },
    answerMessage: {
        alignSelf: 'flex-start', // Align answer messages to the left
        backgroundColor: '#2ea6cb', // Light grey background for answer messages
    },
    messageContainer: {
        padding: 10,
        backgroundColor: '#f1f1f1',
        borderRadius: 10,
        marginVertical: 5,
        alignSelf: 'flex-end',
    },
    listContainer: {
        backgroundColor: 'black',
        flexGrow: 1,
        paddingBottom: 80, // Adjust to ensure the list doesn't overlap with the text box
        width: '100%',
    },
});

export default styles;
