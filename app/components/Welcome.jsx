
import { View, Text, StyleSheet, TouchableOpacity, Animated, Touchable, Image, ImageBackground } from 'react-native'
import { useState } from 'react';

const Welcome = ({ navigation }) => {

    const [scale, setScale] = useState(new Animated.Value(1));

    const handlePressIn = () => {
        Animated.spring(scale, {
            toValue: 1.2,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
        }).start();
    };

    return ( 

        <View style={styles.flex}>
            <ImageBackground source={require("../assets/imgs/backgroundimg.png")} resizeMode="cover" style={styles.backgroundimage}>

                <TouchableOpacity
                    activeOpacity={1}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                >
                    <Animated.Image
                        style={[
                            styles.LogoImage,
                            { transform: [{ scale: scale }] },
                        ]}
                        source={require("../assets/imgs/nutrigenie.png")}
                        resizeMode="contain"
                    />
                </TouchableOpacity>



                <Text style={styles.LogoText}>NutriGenie</Text>
                <TouchableOpacity
                    style={styles.CTAButton}
                    onPress={() => navigation.navigate('Camera')}
                >
                    <Text style={styles.CTAButtonText}>BEGIN</Text>
                </TouchableOpacity>
            </ImageBackground>
        </View>
    )
}

const styles = StyleSheet.create({
    LogoText: {
        fontSize: 30,
        color: 'white',
        marginBottom: 300,
        fontFamily: 'Inter-Regular'
    },
    backgroundimage: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center"
    },
    LogoImage: {
        width: 100,
        height: 100,
        marginBottom: 20
    },
    CTAButton: {
        textAlign: 'center',
        color: 'black',
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        paddingLeft: 70,
        paddingRight: 70,
        paddingTop: 15,
        paddingBottom: 15,
        borderRadius: 50,
        justifyContent: 'center',
        position: 'absolute',
        bottom: 50
    },
    CTAButtonText: {
        fontSize: 20,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'Inter-Bold'
    },
    flex: {
        flex: 1,
        backgroundColor: 'white',
    }
});

export default Welcome;