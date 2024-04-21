
import { View, Text, StyleSheet } from 'react-native'

const Home = ({navigation}) => {

    return(
        <Text style={styles.Home}>
            Home
        </Text>
    )

}

const styles = StyleSheet.create({
    Home: {
        fontSize: 30,
        textAlign: 'center',
        marginTop: 50,
        color: 'black'
    }
});


export default Home