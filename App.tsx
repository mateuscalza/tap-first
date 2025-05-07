import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  Platform,
  useWindowDimensions,
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
  /** Estado & refs */
  const [buttonsDisabled, setButtonsDisabled] = useState(false)
  const [colorName, setColorName] = useState('')
  const soundRef = useRef<Audio.Sound | null>(null)

  /** Altura da janela (sem status bar / notch) */
  const { height: windowHeight } = useWindowDimensions()

  /** Animations (Reanimated) */
  const overlayOpacity = useSharedValue(0)
  const overlayScale = useSharedValue(1)
  const overlayColor = useSharedValue('#000')

  /** Full‑screen Android nav‑bar tweaks */
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden')
      NavigationBar.setBehaviorAsync('overlay-swipe')
      NavigationBar.setBackgroundColorAsync('#00000000')
      NavigationBar.setButtonStyleAsync('light')
    }
  }, [])

  /** Load beep */
  useEffect(() => {
    let mounted = true
    ;(async () => {
      const { sound } = await Audio.Sound.createAsync(
        require('./assets/beep.mp3'),
        { shouldPlay: false }
      )
      if (mounted) soundRef.current = sound
    })()
    return () => {
      mounted = false
      soundRef.current?.unloadAsync()
    }
  }, [])

  /** Helpers */
  const playSound = async () => {
    try {
      await soundRef.current?.replayAsync()
    } catch {}
  }

  const showOverlay = (color: string, name: string) => {
    if (buttonsDisabled) return // debounce

    setButtonsDisabled(true)
    setColorName(name)
    overlayColor.value = color
    overlayScale.value = 0.8
    overlayOpacity.value = 0
    overlayOpacity.value = withTiming(1, { duration: 180 })
    overlayScale.value = withTiming(1, { duration: 180 })
    playSound()

    setTimeout(hideOverlay, 2000)
  }

  const hideOverlay = () => {
    overlayOpacity.value = withTiming(0, { duration: 180 })
    overlayScale.value = withTiming(0.8, { duration: 180 })
    setTimeout(() => {
      setButtonsDisabled(false)
      setColorName('')
    }, 200)
  }

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    backgroundColor: overlayColor.value,
    transform: [{ scale: overlayScale.value }],
  }))

  /** Decide cor pelo pageY absoluto vs windowHeight */
  const handlePressIn = (pageY: number) => {
    // pageY < metade da janela -> Lilás; senão Verde
    if (pageY < windowHeight / 2) {
      showOverlay(PURPLE_COLOR, 'Lilás')
    } else {
      showOverlay(GREEN_COLOR, 'Verde')
    }
  }

  /** Render */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style='light' hidden />

      {/* Um único Pressable ocupando a área útil */}
      <Pressable
        style={styles.pressableArea}
        onPressIn={(e) => handlePressIn(e.nativeEvent.pageY)}
      >
        {/* Half Top */}
        <View style={[styles.halfScreen, { backgroundColor: PURPLE_COLOR }]}>
          <Text style={[styles.buttonText, styles.topText]}>Lilás</Text>
        </View>
        {/* Half Bottom */}
        <View style={[styles.halfScreen, { backgroundColor: GREEN_COLOR }]}>
          <Text style={[styles.buttonText, styles.bottomText]}>Verde</Text>
        </View>
      </Pressable>

      {/* Overlay */}
      <Animated.View
        pointerEvents={overlayOpacity.value > 0.1 ? 'auto' : 'none'}
        style={[styles.overlay, overlayStyle]}
      >
        <Text
          style={[styles.overlayText, { transform: [{ rotate: '180deg' }] }]}
        >
          {colorName}
        </Text>
        <Text style={styles.overlayText}>{colorName}</Text>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  pressableArea: {
    flex: 1,
  },
  halfScreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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
