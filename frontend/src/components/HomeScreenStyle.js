import { StyleSheet , Dimensions } from 'react-native';

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
        left: 0,
        right: 0,
        paddingHorizontal: 15,
        paddingVertical: 10,
        alignItems: 'center',
        backgroundColor: 'black',
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
    userButton: {
        backgroundColor: '#007AFF',
        borderRadius: 20,
        padding: 10,
        marginRight: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    responseButton: {
        backgroundColor: '#007AFF',
        borderRadius: 20,
        padding: 10,
        marginLeft: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 20,
    },
    userMessage: {
        alignSelf: 'flex-end', // Align user messages to the right
        backgroundColor: '#dcd7d1', // Light green background for user messages
        maxWidth: '85%',
        wordWrap: 'break-word',
        paddingRight: '20%',
    },
    answerMessage: {
        alignSelf: 'flex-start', // Align answer messages to the left
        backgroundColor: '#2ea6cb', // Light grey background for answer messages
        maxWidth: '85%',
        wordWrap: 'break-word',
        paddingLeft: '20%',
        // textAlign: 'left',
    },
    messageContainer: {
        padding: 10,
        backgroundColor: '#f1f1f1',
        borderRadius: 10,
        marginVertical: 5,
        alignSelf: 'flex-end',
        marginHorizontal: 10,
    },
    listContainer: {
        backgroundColor: 'black',
        flexGrow: 1,
        paddingBottom: 80, // Adjust to ensure the list doesn't overlap with the text box
        width: '100%',
    },
    sideMenuContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        width: Dimensions.get('window').width * 0.75,
        height: '100%',
        backgroundColor: '#fff',
        zIndex: 10,
        shadowColor: '#000',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    conversationText: {
        fontSize: 16,
        color: 'white',
    },
    conversationItem: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        backgroundColor: '#333',
        marginVertical: 5,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'grey',
        borderRadius: 10,
    },
    conversationId: {
        fontSize: 14,
        color: 'white',
        textAlign: 'center', // Center the text
    },
    menuIcon: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
      },
});

export default styles;
