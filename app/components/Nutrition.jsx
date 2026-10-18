import { useContext, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { FoodsContext } from '../contexts/FoodsContext';
import FoodImage from './FoodImage';
import { AnalysisTabs, BottomTabs, estimateCalories } from './Breakdown';

const Nutrition = ({ navigation }) => {
    const { mealDetails } = useContext(FoodsContext);
    const [activeFood, setActiveFood] = useState(0);
    const [servings, setServings] = useState({});
    const current = mealDetails[activeFood] || mealDetails[0];
    const count = current ? servings[current.food.name] || 1 : 1;
    const display = (value) => value == null ? '—' : (Number(value) * count).toFixed(1).replace(/\.0$/, '');
    return <View style={styles.container}>
        <AnalysisTabs navigation={navigation} active="Nutrition" />
        <ScrollView contentContainerStyle={styles.content}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.foods}>
                {mealDetails.map(({ food }, index) => <TouchableOpacity key={food.name} style={styles.foodChoice} onPress={() => setActiveFood(index)}>
                    <FoodImage name={food.name} style={[styles.foodThumb, index === activeFood && styles.selectedThumb]} />
                    <Text numberOfLines={1} style={[styles.foodLabel, index === activeFood && styles.selectedLabel]}>{food.name}</Text>
                </TouchableOpacity>)}
            </ScrollView>
            {!current ? <Text style={styles.empty}>Scan a meal first to see nutrition information.</Text> : <View style={styles.panel}>
                <View style={styles.heading}><View><Text style={styles.category}>{current.food.category}</Text><Text style={styles.title}>{current.food.name}</Text></View><Text style={styles.badge}>Estimated</Text></View>
                <View style={styles.servingRow}><Text style={styles.servingLabel}>Serving size</Text><View style={styles.servingControl}>
                    <TouchableOpacity onPress={() => setServings({ ...servings, [current.food.name]: Math.max(.5, count - .5) })}><Text style={styles.adjust}>−</Text></TouchableOpacity>
                    <Text style={styles.servingValue}>{count} × 100 g</Text>
                    <TouchableOpacity onPress={() => setServings({ ...servings, [current.food.name]: count + .5 })}><Text style={styles.adjust}>+</Text></TouchableOpacity>
                </View></View>
                {current.nutrition?.protein_g == null ? <Text style={styles.empty}>Nutrition profile unavailable for this food.</Text> : <>
                    <Text style={styles.subheading}>Estimated nutritional content</Text>
                    <Row label="Energy" value={display(estimateCalories(current.nutrition))} unit="kcal" />
                    <Row label="Total fat" value={display(current.nutrition.fat_g)} unit="g" />
                    <Row label="Total carbohydrate" value={display(current.nutrition.carbohydrates_g)} unit="g" />
                    <Row label="Protein" value={display(current.nutrition.protein_g)} unit="g" />
                    <Text style={styles.footnote}>Values are scaled from the available food profile. Calories are estimated from protein, carbohydrate, and fat; detailed micronutrient data is not available.</Text>
                </>}
                {!!current.nutrition?.is_demo_estimate && <Text style={styles.footnote}>{current.nutrition.profile_note}</Text>}
            </View>}
        </ScrollView>
        <BottomTabs />
    </View>;
};

const Row = ({ label, value, unit }) => <View style={styles.row}><Text style={styles.rowLabel}>{label}</Text><Text style={styles.rowValue}>{value} <Text style={styles.unit}>{unit}</Text></Text></View>;
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f2f3ef' },
    content: { padding: 20, gap: 16 },
    foods: { gap: 12, paddingBottom: 4 },
    foodChoice: { width: 76, alignItems: 'center', gap: 6 },
    foodThumb: { width: 62, height: 62, borderRadius: 31, borderWidth: 3, borderColor: 'transparent' },
    selectedThumb: { borderColor: '#4e9565' },
    foodLabel: { color: '#56645a', fontSize: 11, textTransform: 'capitalize' },
    selectedLabel: { color: '#285e43', fontWeight: '600' },
    panel: { backgroundColor: '#fff', borderRadius: 24, padding: 18 },
    heading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
    category: { color: '#668273', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
    title: { color: '#2e3933', fontSize: 22, fontWeight: '600', textTransform: 'capitalize', marginTop: 4 },
    badge: { color: '#527461', backgroundColor: '#e8f0e9', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 15, fontSize: 10 },
    servingRow: { borderBottomWidth: 1, borderBottomColor: '#e7ebe7', marginTop: 14, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    servingLabel: { color: '#445149', fontSize: 13 },
    servingControl: { flexDirection: 'row', gap: 10, alignItems: 'center' },
    servingValue: { color: '#445149', fontSize: 12 },
    adjust: { width: 27, height: 27, borderRadius: 14, overflow: 'hidden', textAlign: 'center', textAlignVertical: 'center', backgroundColor: '#e9f0eb', color: '#41694f', fontSize: 18 },
    subheading: { color: '#3d4942', fontSize: 14, fontWeight: '600', marginTop: 18, marginBottom: 8 },
    row: { minHeight: 44, borderTopWidth: 1, borderStyle: 'dashed', borderColor: '#d9dfd9', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    rowLabel: { color: '#48544c', fontSize: 13 },
    rowValue: { color: '#313b35', fontSize: 13, fontWeight: '600' },
    unit: { color: '#78827b', fontWeight: '400' },
    footnote: { color: '#768078', fontSize: 10, lineHeight: 15, marginTop: 12 },
    empty: { color: '#5d655f', textAlign: 'center', padding: 20 },
});
export default Nutrition;
