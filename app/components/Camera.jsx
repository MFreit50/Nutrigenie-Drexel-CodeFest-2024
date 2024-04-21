import { useState, useEffect } from 'react';
import axios from 'axios';
import FormData from 'form-data';
import { Platform, StyleSheet, Text, TouchableOpacity, Image, Touchable } from 'react-native';
import ImageResizer from 'react-native-image-resizer';
import { RNCamera } from 'react-native-camera';

const Camera = ({ navigation, setFoods }) => {

    const [photoUri, setPhotoUri] = useState(null);

    useEffect(() => {
        if (photoUri) {
            const getFoodNames = async () => {
                try {
                    const response = await axios.get('https://jsonplaceholder.typicode.com/posts')
                    //parse response to get foodNames?
                    setFoods(response.data)
                    console.log("RESPONSE", response)
                } catch (error) {
                    console.log("ERROR", error)

                }
            }
            getFoodNames();
        }
    }, [photoUri]);


    const takePicture = async function (camera) {
        const options = { quality: 0.5, base64: true };
        const data = await camera.takePictureAsync(options);
        const resizedPhotoUri = await ImageResizer.createResizedImage(
            data.uri,
            1366,
            768,
            'JPEG',
            80
        );
        setPhotoUri(resizedPhotoUri.uri);
    };

    return (
        photoUri ?
            (
                <>
            <Image
                style={styles.Image}
                source={{ uri: photoUri }}>
            </Image>
            <TouchableOpacity
                    style={styles.CTAButton}
                    onPress={() => navigation.navigate('Rundown')}
                >
                    <Text style={styles.CTAButtonText}>Next</Text>
                </TouchableOpacity>

            </>
            )
            :
            (<>


                <RNCamera
                    style={styles.Camera}
                    type={RNCamera.Constants.Type.back}
                    flashMode={RNCamera.Constants.FlashMode.off}
                    captureAudio={false}
                    resizeMode="cover"
                >
                    {({ camera, status }) => {
                        if (status !== 'READY') return <Text>Not ready</Text>;
                        return (
                            <TouchableOpacity
                                style={styles.Snap}
                                onPress={() => takePicture(camera)}>
                                <Image
                                    style={styles.SnapImage}
                                    source={require('../assets/imgs/cameraicon.png')}
                                ></Image>
                            </TouchableOpacity>
                        );
                    }}
                </RNCamera>


                <TouchableOpacity>
                    <Image
                        style={styles.CameraOverlay}
                        source={require('../assets/imgs/cameraoverlay.png')}
                        resizeMode="contain"
                    ></Image>
                </TouchableOpacity>

                <Image
                    style={styles.CameraOverlayMessage}
                    source={require('../assets/imgs/cameraoverlaymessage.png')}
                    resizeMode="contain"
                ></Image>



            </>
            )
    );
};

const styles = StyleSheet.create({
    Camera: {
        ...StyleSheet.absoluteFillObject,
    },
    CameraOverlay: {
        position: 'absolute',
        alignSelf: 'center',
        width: 315,
        height: 315,
        top: 150,
    },
    CameraOverlayMessage: {
        position: 'absolute',
        alignSelf: 'center',
        height: 80,
        width: 315,
        top: 420,
        marginTop: 50
    },
    RundownButton: {
        position: 'absolute',
        alignSelf: 'center',
        top: 625
    },
    RundownButtonImage: {
        width:200,
    },
    BackButton: {
        position: 'absolute',
        height: 10,
        width: 10,
        top: 50,
        left: 30,
        alignSelf: 'flex-start',
        padding: 50
    },
    Image: {
        ...StyleSheet.absoluteFillObject,
    },
    Snap: {
        alignSelf: 'center',
        position: 'absolute',
        bottom: 50,
    },
    SnapImage: {
        width: 75,
        height: 75,
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
        bottom: 50,
        alignSelf: 'center', // Add this
        flex: 1, // And this
    },
    CTAButtonText: {
        fontSize: 20,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'Inter-Bold'
    },
});


export default Camera;