import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FoodsContext } from '../contexts/FoodsContext';
import { API_URL } from '../config';
import FoodImage from './FoodImage';

const tabs = [['Rundown', 'Overview'], ['Nutrition', 'Nutrition'], ['Alternatives', 'Alternatives']];

const Breakdown = ({ navigation }) => {
    const { foods, mealPhotoUri, mealDetails, setMealDetails } = useContext(FoodsContext);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeFood, setActiveFood] = useState(0);

    useEffect(() => {
        let active = true;
        const load = async () => {
            if (!foods.length || mealDetails.length) return;
            setLoading(true);
            setError('');
            const results = await Promise.all(foods.map(async (food) => {
                const name = typeof food === 'string' ? food : food.name;
                try {
                    const [nutrition, recommendations] = await Promise.all([
                        axios.get(`${API_URL}/nutrition`, { params: { food_name: name }, timeout: 20000 }),
                        axios.get(`${API_URL}/recommendations`, { params: { food_name: name, number_of_recommendations: 5 }, timeout: 20000 }),
                    ]);
                    return { food: { name, category: typeof food === 'string' ? 'Other' : food.category || 'Other' }, nutrition: nutrition.data, recommendations: recommendations.data.recommendations || [] };
                } catch {
                    return { food: { name, category: typeof food === 'string' ? 'Other' : food.category || 'Other' }, nutrition: null, recommendations: [], failed: true };
                }
            }));
            if (active) {
                setMealDetails(results);
                if (results.every((result) => result.failed)) setError('Could not load meal details. Check your connection and retry.');
                setLoading(false);
            }
        };
        load();
        return () => { active = false; };
    }, [foods, mealDetails.length, setMealDetails]);

    const current = mealDetails[activeFood] || mealDetails[0];
    const handleBack = () => {
        if (activeFood > 0) setActiveFood(activeFood - 1);
        else navigation.goBack();
    };
    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerRow}>
                    <TouchableOpacity onPress={handleBack} style={styles.headerAction} accessibilityLabel={activeFood > 0 ? 'Previous food' : 'Go back'}><Text style={styles.backText}>‹</Text></TouchableOpacity>
                    <Image source={require('../assets/imgs/nutrigenie.png')} style={styles.logo} resizeMode="contain" />
                    <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.headerAction} accessibilityLabel="Open menu"><Text style={styles.menuText}>☰</Text></TouchableOpacity>
                </View>
                <Text style={styles.plateTitle}>Untitled Plate</Text>
                <View style={styles.tabs}>{tabs.map(([route, label]) => <TouchableOpacity key={route} style={[styles.tab, route === 'Rundown' && styles.activeTab]} onPress={() => route !== 'Rundown' && navigation.navigate(route)}><Text style={[styles.tabText, route === 'Rundown' && styles.activeTabText]}>{label}</Text></TouchableOpacity>)}</View>
            </View>
            <ScrollView contentContainerStyle={styles.content}>
                {loading && <ActivityIndicator size="large" color="#408458" />}
                {!!error && <TouchableOpacity onPress={() => setMealDetails([])}><Text style={styles.error}>{error} Tap to retry.</Text></TouchableOpacity>}
                {!loading && !current && <Text style={styles.empty}>No meal details yet. Analyze a photo to get started.</Text>}
                {current && <>
                    {mealPhotoUri ? <Image source={{ uri: mealPhotoUri }} style={styles.foodImage} resizeMode="cover" /> : <FoodImage name={current.food.name} style={styles.foodImage} />}
                    <Text style={styles.category}>{current.food.category}</Text>
                    <Text style={styles.foodName}>{current.food.name}</Text>
                    <View style={styles.glanceHeading}><Text style={styles.sectionTitle}>At a glance</Text><Text style={styles.basis}>Approx. per 100 g</Text></View>
                    {current.nutrition?.protein_g == null ? <Text style={styles.empty}>Nutrition profile unavailable for this food.</Text> : <View style={styles.glanceCard}>
                        <Metric label="Calories" value={estimateCalories(current.nutrition) ?? '—'} unit="kcal" />
                        <Metric label="Fat" value={current.nutrition.fat_g} unit="g" />
                        <Metric label="Carbs" value={current.nutrition.carbohydrates_g} unit="g" />
                        <Metric label="Protein" value={current.nutrition.protein_g} unit="g" />
                    </View>}
                    {current.nutrition?.profile_note && <Text style={styles.note}>{current.nutrition.profile_note}</Text>}
                    {current.recommendations?.length > 0 && <TouchableOpacity onPress={() => navigation.navigate('Alternatives')}><Text style={styles.link}>Explore similar food ideas →</Text></TouchableOpacity>}
                    {mealDetails.length > 1 && <View style={styles.pager}><TouchableOpacity onPress={() => setActiveFood((activeFood + mealDetails.length - 1) % mealDetails.length)}><Text style={styles.pagerButton}>‹</Text></TouchableOpacity><Text style={styles.basis}>{activeFood + 1} of {mealDetails.length}</Text><TouchableOpacity onPress={() => setActiveFood((activeFood + 1) % mealDetails.length)}><Text style={styles.pagerButton}>›</Text></TouchableOpacity></View>}
                </>}
            </ScrollView>
            <BottomTabs />
        </View>
    );
};

export const AnalysisTabs = ({ navigation, active }) => <View style={styles.header}>
    <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.headerAction} accessibilityLabel="Go back"><Text style={styles.backText}>‹</Text></TouchableOpacity>
        <Image source={require('../assets/imgs/nutrigenie.png')} style={styles.logo} resizeMode="contain" />
        <TouchableOpacity onPress={() => navigation.navigate('Home')} style={styles.headerAction} accessibilityLabel="Open menu"><Text style={styles.menuText}>☰</Text></TouchableOpacity>
    </View>
    <Text style={styles.plateTitle}>Untitled Plate</Text>
    <View style={styles.tabs}>{tabs.map(([route, label]) => <TouchableOpacity key={route} style={[styles.tab, route === active && styles.activeTab]} onPress={() => route !== active && navigation.navigate(route)}><Text style={[styles.tabText, route === active && styles.activeTabText]}>{label}</Text></TouchableOpacity>)}</View>
</View>;

export const BottomTabs = () => <View style={styles.bottomTabs}>
    <View style={styles.bottomItem}><Text style={styles.bottomIcon}>▤</Text><Text style={styles.bottomText}>Saved plates</Text></View>
    <View style={[styles.bottomItem, styles.bottomActive]}><Text style={styles.bottomIcon}>◎</Text><Text style={styles.bottomText}>Camera</Text></View>
    <View style={styles.bottomItem}><Text style={styles.bottomIcon}>◯</Text><Text style={styles.bottomText}>Profile</Text></View>
</View>;

const Metric = ({ label, value, unit }) => <View style={styles.metric}><View style={styles.ring}><Text style={styles.metricValue}>{value}</Text><Text style={styles.metricUnit}>{unit}</Text></View><Text style={styles.metricLabel}>{label}</Text></View>;
export const estimateCalories = (nutrition) => {
    if (nutrition?.calories_kcal != null) return nutrition.calories_kcal;
    if (nutrition?.protein_g == null || nutrition?.carbohydrates_g == null || nutrition?.fat_g == null) return null;
    return Math.round(Number(nutrition.protein_g) * 4 + Number(nutrition.carbohydrates_g) * 4 + Number(nutrition.fat_g) * 9);
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f3ef' },
    header: { backgroundColor: '#6c8280', borderBottomLeftRadius: 28, borderBottomRightRadius: 28, paddingHorizontal: 18, paddingTop: 6, paddingBottom: 14 },
    headerRow: { height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    headerAction: { width: 42, alignItems: 'flex-start' },
    logo: { width: 36, height: 36, borderRadius: 10 },
    backText: { color: '#fff', fontSize: 42, lineHeight: 44 },
    menuText: { color: '#fff', fontSize: 22 },
    plateTitle: { color: '#303a36', fontSize: 22, fontWeight: '600', textAlign: 'center', marginTop: 6, marginBottom: 12 },
    tabs: { flexDirection: 'row', backgroundColor: '#e6ebe8', borderRadius: 26, padding: 4, gap: 3 },
    tab: { flex: 1, borderRadius: 22, minHeight: 39, justifyContent: 'center', alignItems: 'center' },
    activeTab: { backgroundColor: '#fff' },
    tabText: { color: '#606b65', fontSize: 13 },
    activeTabText: { color: '#29453b', fontWeight: '600' },
    content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, gap: 10 },
    foodImage: { width: '100%', height: 260, borderRadius: 25 },
    category: { color: '#668273', fontSize: 12, fontWeight: '600', textTransform: 'uppercase', marginTop: 4 },
    foodName: { color: '#2e3933', fontSize: 25, fontWeight: '600', textTransform: 'capitalize' },
    glanceHeading: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', marginTop: 8 },
    sectionTitle: { color: '#3e4d44', fontSize: 16, fontWeight: '600' },
    basis: { color: '#768179', fontSize: 12 },
    glanceCard: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: '#408458', borderRadius: 24, paddingVertical: 17, paddingHorizontal: 7 },
    metric: { flex: 1, alignItems: 'center', gap: 8 },
    ring: { width: 66, height: 66, borderRadius: 36, borderWidth: 2, borderColor: '#ffffffa8', justifyContent: 'center', alignItems: 'center' },
    metricValue: { color: '#fff', fontSize: 15, fontWeight: '600' },
    metricUnit: { color: '#fff', fontSize: 10 },
    metricLabel: { color: '#fff', fontSize: 11 },
    note: { color: '#68756d', fontSize: 11, lineHeight: 16 },
    link: { color: '#3c7254', fontSize: 14, fontWeight: '600', paddingVertical: 8 },
    pager: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
    pagerButton: { color: '#3c594a', backgroundColor: '#e4eae4', fontSize: 20, width: 30, height: 30, textAlign: 'center', overflow: 'hidden', borderRadius: 15 },
    empty: { color: '#5d655f', textAlign: 'center', padding: 20 },
    error: { color: '#8b2929', textAlign: 'center', padding: 10 },
    bottomTabs: { height: 68, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e6eae5', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
    bottomItem: { alignItems: 'center', gap: 2, flex: 1 },
    bottomActive: { color: '#527d5e' },
    bottomIcon: { color: '#89918b', fontSize: 20 },
    bottomText: { color: '#89918b', fontSize: 10 },
});

export default Breakdown;
