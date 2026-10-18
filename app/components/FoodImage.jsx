import { useEffect, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import axios from 'axios';
import { API_URL } from '../config';

const FoodImage = ({ name, style }) => {
    const [imageUrl, setImageUrl] = useState('');

    useEffect(() => {
        let active = true;
        if (!name) return undefined;
        axios.get(`${API_URL}/search_image`, { params: { query: name }, timeout: 10000 })
            .then(({ data }) => { if (active && data.image_url) setImageUrl(data.image_url); })
            .catch(() => {});
        return () => { active = false; };
    }, [name]);

    return (
        <View style={[styles.frame, style]}>
            {imageUrl ? <Image
                source={{ uri: imageUrl }}
                style={styles.image}
                resizeMode="cover"
                onError={() => setImageUrl('')}
            /> : <View style={styles.placeholder} accessibilityLabel="Food image unavailable">
                <View style={styles.plate}><View style={styles.plateCenter} /></View>
                <Text style={styles.placeholderLabel}>Image unavailable</Text>
            </View>}
        </View>
    );
};

const styles = StyleSheet.create({
    frame: { overflow: 'hidden', backgroundColor: '#f5f6f3', borderRadius: 20 },
    image: { width: '100%', height: '100%' },
    placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#f2f3ee' },
    plate: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: '#cbd4cc', alignItems: 'center', justifyContent: 'center' },
    plateCenter: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: '#d8ded7' },
    placeholderLabel: { color: '#7b857d', fontSize: 10 },
});

export default FoodImage;
