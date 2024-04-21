
import { View, Text, Image, StyleSheet } from 'react-native'
import { useState, useEffect } from 'react'

const ItemRecommendation = ({ recommendations }) => {

    return(
        <View>
            <View style={styles.FoodOverlay}>
                <Text style={styles.FoodText}></Text>
            </View>
            {recommendations.map((recommendation) => (
                <View>
                    <Text>{recommendation}</Text>
                    <Image source={{uri: recommendationURLs[recommendations.indexOf(recommendation)]}}/>
                </View>
            ))}
        </View>
    )
}

const styles = StyleSheet.create({
    FoodOverlay: {
        backgroundColor: '#fffffc',
        width: '75%',
        paddingTop: 5,
        paddingBottom: 5,        
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 500
    },
    FoodText: {
        color: '#393837',
        fontSize: 20,
        padding: 10,
        fontFamily: 'Inter-Regular'
    }
}


export default ItemRecommendation