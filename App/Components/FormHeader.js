import { StyleSheet, Text, View, Animated} from 'react-native';
import React from 'react';

const FormHeader = ({ leftHeading, rightHeading, subHeading, subHeading2, leftHeaderTranslateX = 40, rightHeaderTransalateY = -20, rightHeaderOpacity = 0}) => {
  return (<>
    <View style={styles.container}>
      <Animated.Text style={[styles.heading,{transform: [{translateX:leftHeaderTranslateX}]}]}>{leftHeading}</Animated.Text>
      <Animated.Text style={[styles.heading,{opacity: rightHeaderOpacity, transform: [{translateY: rightHeaderTransalateY}] }]}>{rightHeading}</Animated.Text>
    </View>
      <Text style={styles.subheading}>{subHeading}</Text>
      <Text style={styles.subheading}>{subHeading2}</Text>
      </>   
  );
};

export default FormHeader;

const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    heading: {
      fontSize: 30,
      fontWeight: 'bold',
      color: 'black',
    },
    subheading: {
      fontSize: 20,
      color: 'black',
      textAlign: 'center',
    }, 
  });