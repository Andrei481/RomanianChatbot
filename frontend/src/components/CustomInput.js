import React from 'react'
import { View, TextInput, StyleSheet } from 'react-native'

const CustomInput = ({ value, setValue, placeholder, secureTextEntry, keyboardType, autoCapitalize }) => {
    const autoCapitalizeDefault = autoCapitalize === undefined ? "none" : autoCapitalize;
    return (
        <View style={styles.container}>
            <TextInput
                placeholder={placeholder}
                placeholderTextColor="lightgrey"
                style={styles.input}
                value={value}
                onChangeText={setValue}
                secureTextEntry={secureTextEntry}
                keyboardType={keyboardType}
                autoCapitalize={autoCapitalizeDefault}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        width: '100%',
        height: '10%',
        borderColor: 'white',
        borderWidth: 5,
        borderRadius: 10,
        allignSelf: 'center',
        

        paddingHorizontal: 10,
        marginVertical: 10,
    },
    input: {},
});

export default CustomInput;