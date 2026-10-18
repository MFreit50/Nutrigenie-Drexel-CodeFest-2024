import { useContext } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FoodsContext } from '../contexts/FoodsContext';
import FoodImage from './FoodImage';
import { AnalysisTabs, BottomTabs } from './Breakdown';

const Alternatives = ({ navigation }) => {
    const { mealDetails, selectedAlternatives, setSelectedAlternatives } = useContext(FoodsContext);
    const toggleChoice = (food, choice) => {
        const current = selectedAlternatives[food] || [];
        setSelectedAlternatives({ ...selectedAlternatives, [food]: current.includes(choice) ? current.filter((item) => item !== choice) : [...current, choice] });
    };
    return <View style={styles.container}>
        <AnalysisTabs navigation={navigation} active="Alternatives" />
        <ScrollView contentContainerStyle={styles.content}>
            <Text style={styles.kicker}>THOUGHTFUL SWAPS</Text>
            <Text style={styles.title}>Similar nutrition, new ideas</Text>
            <Text style={styles.subtitle}>Explore foods with a comparable balance of protein, carbohydrates, and fat.</Text>
            {!mealDetails.length && <Text style={styles.empty}>Scan a meal first to see similar options.</Text>}
            {mealDetails.map(({ food, nutrition, recommendations }) => <View key={food.name} style={styles.group}>
                <View style={styles.groupHeading}><Text style={styles.groupTitle}>Similar to {food.name}</Text><Text style={styles.count}>{recommendations.length} ideas</Text></View>
                {!recommendations.length ? <Text style={styles.empty}>{nutrition?.protein_g == null ? 'No reliable nutrition profile is available to find similar foods.' : 'No similar foods were found in the available dataset.'}</Text> : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.cards}>
                        {recommendations.map((choice, index) => {
                            const selected = (selectedAlternatives[food.name] || []).includes(choice);
                            return <TouchableOpacity key={choice} accessibilityRole="checkbox" accessibilityState={{ checked: selected }} style={[styles.card, selected && styles.selectedCard]} onPress={() => toggleChoice(food.name, choice)}>
                                <FoodImage name={choice} style={styles.image} />
                                <Text style={styles.number}>{String(index + 1).padStart(2, '0')}</Text>
                                <Text style={styles.check}>{selected ? '✓' : '+'}</Text>
                                <Text style={styles.name}>{choice}</Text>
                                <Text style={styles.hint}>{selected ? 'Added to your ideas' : 'Comparable macro profile'}</Text>
                            </TouchableOpacity>;
                        })}
                    </ScrollView>
                )}
                {(selectedAlternatives[food.name] || []).length > 0 && <Text style={styles.selected}>Your picks: {selectedAlternatives[food.name].join(', ')}</Text>}
            </View>)}
        </ScrollView>
        <BottomTabs />
    </View>;
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f3ef' },
    content: { padding: 20, paddingBottom: 24, gap: 12 },
    kicker: { color: '#668273', fontSize: 12, fontWeight: '600', letterSpacing: 1 },
    title: { color: '#2e3933', fontSize: 24, fontWeight: '600' },
    subtitle: { color: '#69746d', fontSize: 13, lineHeight: 20, marginBottom: 6 },
    group: { backgroundColor: '#fff', borderRadius: 22, borderWidth: 1, borderColor: '#e7eae5', paddingVertical: 14, gap: 12 },
    groupHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 },
    groupTitle: { color: '#3b4943', fontSize: 16, fontWeight: '600', textTransform: 'capitalize' },
    count: { color: '#7a857e', fontSize: 11 },
    cards: { paddingHorizontal: 12, gap: 10 },
    card: { width: 158, minHeight: 205, padding: 8, borderWidth: 1, borderColor: '#edf0eb', borderRadius: 22, position: 'relative', gap: 6 },
    selectedCard: { borderColor: '#75a282', backgroundColor: '#f5faf5' },
    image: { width: 140, height: 116, borderRadius: 16 },
    number: { position: 'absolute', left: 14, top: 14, overflow: 'hidden', borderRadius: 16, paddingHorizontal: 7, paddingVertical: 3, backgroundColor: '#ffffffeb', color: '#536b5c', fontSize: 10 },
    check: { position: 'absolute', right: 14, top: 14, width: 27, height: 27, overflow: 'hidden', textAlign: 'center', borderRadius: 15, backgroundColor: '#ffffffeb', color: '#50745a', fontSize: 19, fontWeight: '700' },
    name: { color: '#333b36', fontSize: 14, fontWeight: '600', textTransform: 'capitalize' },
    hint: { color: '#778179', fontSize: 10 },
    selected: { color: '#537d72', fontSize: 12, paddingHorizontal: 14 },
    empty: { color: '#5d655f', textAlign: 'center', padding: 20 },
});

export default Alternatives;
