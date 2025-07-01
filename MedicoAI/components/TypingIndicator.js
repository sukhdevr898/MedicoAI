import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const TypingIndicator = ({ isVisible, color = '#0c7ff2' }) => {
  const dot1 = useRef(new Animated.Value(0.3)).current;
  const dot2 = useRef(new Animated.Value(0.3)).current;
  const dot3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (isVisible) {
      const animateTyping = () => {
        Animated.sequence([
          Animated.parallel([
            Animated.timing(dot1, { 
              toValue: 1, 
              duration: 500, 
              useNativeDriver: true 
            }),
          ]),
          Animated.parallel([
            Animated.timing(dot2, { 
              toValue: 1, 
              duration: 500, 
              useNativeDriver: true 
            }),
          ]),
          Animated.parallel([
            Animated.timing(dot3, { 
              toValue: 1, 
              duration: 500, 
              useNativeDriver: true 
            }),
          ]),
          Animated.parallel([
            Animated.timing(dot1, { 
              toValue: 0.3, 
              duration: 500, 
              useNativeDriver: true 
            }),
            Animated.timing(dot2, { 
              toValue: 0.3, 
              duration: 500, 
              useNativeDriver: true 
            }),
            Animated.timing(dot3, { 
              toValue: 0.3, 
              duration: 500, 
              useNativeDriver: true 
            }),
          ]),
        ]).start(() => {
          if (isVisible) animateTyping();
        });
      };
      animateTyping();
    } else {
      // Reset dots when not visible
      dot1.setValue(0.3);
      dot2.setValue(0.3);
      dot3.setValue(0.3);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.dot, 
          { 
            backgroundColor: color,
            opacity: dot1,
            transform: [
              {
                scale: dot1.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [1, 1.2],
                })
              }
            ]
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.dot, 
          { 
            backgroundColor: color,
            opacity: dot2,
            transform: [
              {
                scale: dot2.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [1, 1.2],
                })
              }
            ]
          }
        ]} 
      />
      <Animated.View 
        style={[
          styles.dot, 
          { 
            backgroundColor: color,
            opacity: dot3,
            transform: [
              {
                scale: dot3.interpolate({
                  inputRange: [0.3, 1],
                  outputRange: [1, 1.2],
                })
              }
            ]
          }
        ]} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
  },
});

export default TypingIndicator;