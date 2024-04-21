import { View, Text, StyleSheet } from 'react-native'
import { useState, useEffect } from 'react';
import ItemRecommendation from './ItemRecommendation'

const Rundown = ({ foods }) => {

    const [recommendations, setRecommendations] = useState([]);

    useEffect(() => {
        const getRecommendations = async (food) => {
            const url = 'https://jsonplaceholder.typicode.com/'
            const endpoint = 'dummyendpoint'
            try {
                const response = await axios.get(`${url}${endpoint}?food=${food}`) //pass in food name
                return response.data; //check if response.data is the right value
            } catch (error) {
                console.log("ERROR", error)
            }
        }

        const fetchRecommendations = async () => {
            const newRecommendations = {};
            for (let food of foods) {
                newRecommendations[food] = await getRecommendations(food);
            }
            setRecommendations(newRecommendations);
        }

        fetchRecommendations();

    }, [foods]);

    return (
        <View style={styles.container}>
            <View style={styles.BreakdownBackground}>
                <View style={styles.BreakdownOverlay}>
                    <Text style={styles.BreakdownText}>Breakdown</Text>
                </View>
            </View>

            <View>
                <Text>We found:
                    {foods.map((food) => {
                        return (
                            <Text>{food}</Text>
                        )
                    })}
                </Text>
            </View>

            <View style={styles.FactsOverlay}>
                <Text style={styles.FactsText}>Alternative Recommendations</Text>
            </View>
            {
                recommendations.map((recommendation, i) => {
                    return (
                        <ItemRecommendation originalFood={foods[i]} recommendations={recommendation} />
                    )
                })
            }
        </View>


    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ebebe8',
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
    FactsOverlay: {
        backgroundColor: '#fffffc',
        width: '75%',
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
})

export default Rundown