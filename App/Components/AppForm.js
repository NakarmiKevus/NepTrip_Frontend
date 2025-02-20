// Components/AppForm.js
import React, { useState, useRef } from 'react';
import { ScrollView, StyleSheet, View, SafeAreaView, Animated, Dimensions } from 'react-native';
import SelectorButton from './SelectorButton';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import FormHeader from './FormHeader';

const { width } = Dimensions.get('window');

export default function AppForm({ navigation }) {
    const [activeTab, setActiveTab] = useState('login');
    const animation = useRef(new Animated.Value(0)).current;
    const scrollViewRef = useRef();

    return (
        <SafeAreaView style={styles.mainContainer}>
            <View style={styles.headerContainer}>
                <FormHeader
                    leftHeading="Welcome "
                    rightHeading="Back "
                    subHeading="To "
                    subHeading2="NepTrip "
                    rightHeaderOpacity={animation.interpolate({
                        inputRange: [0, width],
                        outputRange: [1, 0]
                    })}
                    leftHeaderTranslateX={animation.interpolate({
                        inputRange: [0, width],
                        outputRange: [0, 40]
                    })}
                    rightHeaderTransalateY={animation.interpolate({
                        inputRange: [0, width],
                        outputRange: [0, -20]
                    })}
                />
            </View>
            <View style={styles.selectorContainer}>
                <SelectorButton
                    style={styles.borderLeft}
                    backgroundColor={activeTab === 'login' ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0.4)'}
                    title="Login"
                    onPress={() => scrollViewRef.current.scrollTo({ x: 0 })}
                />
                <SelectorButton
                    style={styles.borderRight}
                    backgroundColor={activeTab === 'signup' ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0.4)'}
                    title="Sign up"
                    onPress={() => scrollViewRef.current.scrollTo({ x: width })}
                />
            </View>
            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={Animated.event(
                    [{ nativeEvent: { contentOffset: { x: animation } } }],
                    { useNativeDriver: false }
                )}
                onMomentumScrollEnd={(event) => {
                    const offsetX = event.nativeEvent.contentOffset.x;
                    setActiveTab(offsetX === 0 ? 'login' : 'signup');
                }}
            >
                <LoginForm navigation={navigation} />
                <ScrollView>
                    <SignupForm navigation={navigation} />
                </ScrollView>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        paddingTop: 120,
    },
    headerContainer: {
        height: 80,
    },
    selectorContainer: {
        flexDirection: 'row',
        padding: 20,
    },
    borderLeft: {
        borderTopLeftRadius: 8,
        borderBottomLeftRadius: 8,
    },
    borderRight: {
        borderTopRightRadius: 8,
        borderBottomRightRadius: 8,
    },
});