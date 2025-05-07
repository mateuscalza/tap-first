import { StatusBar } from 'expo-status-bar'
import { useState, useEffect, useRef } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated'
import * as NavigationBar from 'expo-navigation-bar'
import { Audio } from 'expo-av'

// Cores
const PURPLE_COLOR = '#9370DB' // Lilás
const GREEN_COLOR = '#2E8B57' // Verde

export default function App() {
  const [buttonsDisabled, setButtonsDisabled] = useState(false)
  const [colorName, setColorName] = useState('')
  const soundRef = useRef<Audio.Sound | null>(null)

  // Animações para o overlay
  const overlayOpacity = useSharedValue(0)
  const overlayScale = useSharedValue(1)
  const overlayColor = useSharedValue('#000')

  // Rotação dos textos
  const topTextRotation = 180
  const bottomTextRotation = 0

  // Fullscreen no Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden')
      NavigationBar.setBehaviorAsync('overlay-swipe')
      NavigationBar.setBackgroundColorAsync('#00000000')
      NavigationBar.setButtonStyleAsync('light')
    }
  }, [])

  // Carregar som
  useEffect(() => {
    let isMounted = true
    ;(async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/beep.mp3'), // Coloque um beep.mp3 em assets
        { shouldPlay: false }
      )
      if (isMounted) soundRef.current = sound
    })()
    return () => {
      isMounted = false
      if (soundRef.current) soundRef.current.unloadAsync()
    }
  }, [])

  const playSound = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.replayAsync()
      }
    } catch (e) {}
  }

  const showOverlay = async (color: string, name: string) => {
    setButtonsDisabled(true)
    setColorName(name)
    overlayColor.value = color
    overlayScale.value = 0.8
    overlayOpacity.value = 0
    overlayOpacity.value = withTiming(1, { duration: 180 })
    overlayScale.value = withTiming(1, { duration: 180 })
    playSound()
    setTimeout(() => {
      hideOverlay()
    }, 2000)
  }

  const hideOverlay = () => {
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
      <StatusBar style='light' hidden />

      <View style={styles.buttonsContainer}>
        <View style={[styles.halfScreen, { backgroundColor: PURPLE_COLOR }]}>
          <TouchableOpacity
            style={styles.touchButton}
            onPressIn={() => showOverlay(PURPLE_COLOR, 'Lilás')}
            disabled={buttonsDisabled}
          >
            <Text style={[styles.buttonText, styles.topText]}>Lilás</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.halfScreen, { backgroundColor: GREEN_COLOR }]}>
          <TouchableOpacity
            style={styles.touchButton}
            onPressIn={() => showOverlay(GREEN_COLOR, 'Verde')}
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
    backgroundColor: '#000',
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
    transform: [{ rotate: '180deg' }],
  },
  bottomText: {
    transform: [{ rotate: '0deg' }],
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
