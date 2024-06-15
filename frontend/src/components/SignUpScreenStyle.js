import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
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
        padding: 20,
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
    nonEditableBox: {
        backgroundColor: '#d3d3d3',
        borderRadius: 10,
        padding: 10,
        marginVertical: 10,
    },
    nonEditableText: {
        color: '#333',
        fontSize: 16,
    },
});

export default styles;