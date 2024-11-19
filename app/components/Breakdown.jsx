import axios from 'axios';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useState, useEffect, useContext } from 'react';
import ItemRecommendation from './ItemRecommendation'
import { FoodsContext } from '../contexts/FoodsContext'
//implement dotenv

const Breakdown = ({ navigation }) => {

    const [recommendations, setRecommendations] = useState([]);
    const { foods } = useContext(FoodsContext);

    useEffect(() => {
        const getRecommendations = async (food) => {
            const url = "https://drexel-codefest-2024-3.onrender.com"
            const endpoint = '/recommendations'
            try {
                const response = await axios.get(`${url}${endpoint}?food_name=${food}&number_of_recommendations=5`) //pass in food name
                const data = response.data["recommendations"]
                console.log("DATA", data)
                return data; //check if response.data is the right value
            } catch (error) {
                console.log("ERROR", error)
            }
        }

        const fetchRecommendations = async () => {
            for(let i = 0; i < foods.length; i++) {
                const recommendation = await getRecommendations(foods[i]);
                setRecommendations([...recommendations, recommendation]);
            }
        }

        fetchRecommendations()
        console.log("RECOMMENDATIONS", recommendations)

    }, [foods]);

    return (
        <View style={styles.container}>
            <View style={styles.BreakdownBackground}>
                <View style={styles.BreakdownOverlay}>
                    <Text style={styles.BreakdownText}>Breakdown</Text>
                </View>
            </View>

            <View style={styles.group}>
                <View style={styles.FactsOverlay}>
                    <Text style={styles.FactsText}>Nutritional Facts</Text>
                </View>
                <View style={styles.DataOverlay}>
                    <Text style={styles.DataText}>Data</Text>
                </View>
            </View>

            <View style = {styles.group}>
                <View style={styles.FactsOverlay}>
                    <Text style={styles.FactsText}>Recommendations</Text>
                </View>
                <View style={styles.DataOverlay}>
                    <Text style={styles.DataText}>Data</Text>
                </View>
            </View>

            <TouchableOpacity
                style={styles.DoneButton}
                onPress={() => navigation.navigate('Home')}
            >
                <Text style={styles.DoneButtonText}>Done</Text>
            </TouchableOpacity>
        </View>

    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ebebe8',
        gap: 75
    },
    flex: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 50
    },
    BreakdownBackground: {
        position: 'absolute', // Add this
        top: 0, // And this
        backgroundColor: '#637d7f',
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20,
        paddingBottom: 20,
    },
    BreakdownOverlay: {
        backgroundColor: '#d7e1e0',
        width: '35%',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 500
    },
    BreakdownText: {
        color: '#393837',
        fontSize: 20,
        padding: 10,
        fontFamily: 'Inter-Regular'
    },
    group: {
        width: '70%',
        gap: 10
    },
    FactsOverlay: {
        backgroundColor: '#fffffc',
        paddingTop: 5,
        paddingBottom: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 500
    },
    FactsText: {
        color: '#393837',
        fontSize: 20,
        padding: 10,
        fontFamily: 'Inter-Regular'
    },
    DataOverlay: {
        backgroundColor: '#f4f5f3',
        paddingTop: 5,
        paddingBottom: 5,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 15
    },
    DataText: {
        color: '#393837',
        fontSize: 20,
        padding: 10,
        fontFamily: 'Inter-Regular'
    },
    DoneButton: {
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
    DoneButtonText: {
        fontSize: 20,
        textAlign: 'center',
        color: 'black',
        fontFamily: 'Inter-Bold'
    },
})


export default Breakdown