import { useContext, useState } from 'react';
import axios from 'axios';
import { ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ImageResizer from 'react-native-image-resizer';
import { RNCamera } from 'react-native-camera';
import { FoodsContext } from '../contexts/FoodsContext';
import { API_URL } from '../config';

const Camera = ({ navigation }) => {
    const [photo, setPhoto] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { setFoods, setMealDetails, setSelectedAlternatives, setMealPhotoUri } = useContext(FoodsContext);

    const takePicture = async (camera) => {
        try {
            setError('');
            const data = await camera.takePictureAsync({ quality: 0.8 });
            const resized = await ImageResizer.createResizedImage(data.uri, 1400, 1400, 'JPEG', 80);
            setPhoto(resized);
        } catch (e) {
            setError('Could not take the photo. Please try again.');
        }
    };

    const analyzePhoto = async () => {
        if (!photo || loading) return;
        setLoading(true);
        setError('');
        const body = new FormData();
        body.append('file', { uri: photo.uri, type: 'image/jpeg', name: 'meal.jpg' });
        try {
            const response = await axios.post(`${API_URL}/picture`, body, { timeout: 60000 });
            const detectedFoods = Array.isArray(response.data.foods) ? response.data.foods : [];
            if (!detectedFoods.length) {
                setError('No food was found in this photo. Try another photo.');
                return;
            }
            setFoods(detectedFoods.map((food) => typeof food === 'string' ? { name: food, category: 'Other' } : { ...food, category: food.category || 'Other' }));
            setMealPhotoUri(photo.uri);
            setMealDetails([]);
            setSelectedAlternatives({});
            navigation.navigate('Rundown');
        } catch (e) {
            setError(e.response?.data?.detail || 'Could not analyze the photo. Check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    return photo ? (
        <View style={styles.preview}>
            <Image style={styles.Image} source={{ uri: photo.uri }} />
            <View style={styles.controls}>
                {!!error && <Text style={styles.error}>{error}</Text>}
                <TouchableOpacity style={styles.secondaryButton} onPress={() => { setPhoto(null); setError(''); }} disabled={loading}>
                    <Text style={styles.buttonText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={analyzePhoto} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Analyze meal</Text>}
                </TouchableOpacity>
            </View>
        </View>
    ) : (
        <View style={styles.cameraPage}>
            <RNCamera style={styles.Camera} type={RNCamera.Constants.Type.back} flashMode={RNCamera.Constants.FlashMode.off} captureAudio={false}>
                {({ camera, status }) => status !== 'READY' ? (
                    <View style={styles.message}><Text style={styles.help}>Waiting for camera permission…</Text></View>
                ) : (
                    <TouchableOpacity style={styles.Snap} onPress={() => takePicture(camera)} accessibilityLabel="Take meal photo">
                        <Image style={styles.SnapImage} source={require('../assets/imgs/cameraicon.png')} />
                    </TouchableOpacity>
                )}
            </RNCamera>
            <View pointerEvents="none" style={styles.message}><Text style={styles.help}>Center your meal in the frame</Text></View>
            {!!error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    cameraPage: { flex: 1, backgroundColor: '#17201d' },
    Camera: { ...StyleSheet.absoluteFillObject },
    message: { position: 'absolute', top: 60, alignSelf: 'center', backgroundColor: '#0009', borderRadius: 20, padding: 12 },
    help: { color: '#fff', fontSize: 16 },
    Snap: { position: 'absolute', bottom: 48, alignSelf: 'center' },
    SnapImage: { width: 75, height: 75 },
    preview: { flex: 1, backgroundColor: '#17201d' },
    Image: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%', resizeMode: 'cover' },
    controls: { position: 'absolute', bottom: 32, left: 24, right: 24, gap: 12 },
    primaryButton: { backgroundColor: '#365d52', padding: 16, borderRadius: 30, alignItems: 'center' },
    secondaryButton: { backgroundColor: '#ffffffdd', padding: 14, borderRadius: 30, alignItems: 'center' },
    buttonText: { color: '#17201d', fontSize: 17, fontWeight: '600' },
    error: { color: '#fff', backgroundColor: '#a82f2f', padding: 10, textAlign: 'center', borderRadius: 10 },
});

export default Camera;
