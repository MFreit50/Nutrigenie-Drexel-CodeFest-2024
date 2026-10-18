import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const Home = ({ navigation }) => (
    <View style={styles.container}>
        <Text style={styles.brand}>NutriGenie</Text>
        <Text style={styles.heading}>Make your next meal a little better.</Text>
        <Text style={styles.copy}>Scan a meal to see the foods in it, explore nutrition details, and find similar alternatives.</Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Camera')}>
            <Text style={styles.buttonText}>Scan a meal</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Welcome')}><Text style={styles.link}>Back to welcome</Text></TouchableOpacity>
    </View>
);

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#e9eee9', justifyContent: 'center', alignItems: 'center', padding: 30 },
    brand: { color: '#365d52', fontSize: 18, fontWeight: '700', marginBottom: 32 },
    heading: { color: '#263b35', fontSize: 32, textAlign: 'center', fontWeight: '700' },
    copy: { color: '#4f5d57', fontSize: 17, lineHeight: 25, textAlign: 'center', marginTop: 16, marginBottom: 34 },
    button: { backgroundColor: '#365d52', borderRadius: 32, paddingVertical: 16, paddingHorizontal: 44 },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
    link: { color: '#365d52', padding: 20, fontSize: 15 },
});

export default Home;
