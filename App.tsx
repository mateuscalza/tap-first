import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated'

// Cores
const PURPLE_COLOR = '#9370DB' // Lilás
const GREEN_COLOR = '#2E8B57' // Verde

export default function App() {
  const [buttonsDisabled, setButtonsDisabled] = useState(false)
  const [colorName, setColorName] = useState('')

  // Animações para o overlay
  const overlayOpacity = useSharedValue(0)
  const overlayScale = useSharedValue(1)
  const overlayColor = useSharedValue('#000')

  // Animações para o texto
  const topTextRotation = 0
  const bottomTextRotation = 180

  const showOverlay = (color: string, name: string) => {
    setButtonsDisabled(true)
    setColorName(name)
    overlayColor.value = color
    overlayScale.value = 0.8
    overlayOpacity.value = 0
    // Animação rápida de entrada
    overlayOpacity.value = withTiming(1, { duration: 180 })
    overlayScale.value = withTiming(1, { duration: 180 })
    setTimeout(() => {
      hideOverlay()
    }, 2000)
  }

  const hideOverlay = () => {
    // Animação rápida de saída
    overlayOpacity.value = withTiming(0, { duration: 180 })
    overlayScale.value = withTiming(0.8, { duration: 180 })
    setTimeout(() => {
      setButtonsDisabled(false)
      setColorName('')
    }, 200)
  }

  const overlayStyle = useAnimatedStyle(() => {
    return {
      opacity: overlayOpacity.value,
      backgroundColor: overlayColor.value,
      transform: [{ scale: overlayScale.value }],
    }
  })

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style='auto' />

      <View style={styles.buttonsContainer}>
        <View style={[styles.halfScreen, { backgroundColor: PURPLE_COLOR }]}>
          <TouchableOpacity
            style={styles.touchButton}
            onPress={() => showOverlay(PURPLE_COLOR, 'Lilás')}
            disabled={buttonsDisabled}
          >
            <Text style={[styles.buttonText, styles.topText]}>Lilás</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.halfScreen, { backgroundColor: GREEN_COLOR }]}>
          <TouchableOpacity
            style={styles.touchButton}
            onPress={() => showOverlay(GREEN_COLOR, 'Verde')}
            disabled={buttonsDisabled}
          >
            <Text style={[styles.buttonText, styles.bottomText]}>Verde</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View
        pointerEvents={overlayOpacity.value > 0.1 ? 'auto' : 'none'}
        style={[styles.overlay, overlayStyle]}
      >
        <Text
          style={[
            styles.overlayText,
            { transform: [{ rotate: `${topTextRotation}deg` }] },
          ]}
        >
          {colorName}
        </Text>
        <Text
          style={[
            styles.overlayText,
            { transform: [{ rotate: `${bottomTextRotation}deg` }] },
          ]}
        >
          {colorName}
        </Text>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  buttonsContainer: {
    flex: 1,
    flexDirection: 'column',
  },
  halfScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  touchButton: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  topText: {
    transform: [{ rotate: '0deg' }],
  },
  bottomText: {
    transform: [{ rotate: '180deg' }],
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
    zIndex: 10,
  },
  overlayText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
})
