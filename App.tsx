import { StatusBar } from 'expo-status-bar'
import { useEffect, useRef, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  useWindowDimensions,
  GestureResponderEvent,
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

// Janela (ms) dentro da qual consideramos toques "simultâneos"
const DECISION_WINDOW = 40

export default function App() {
  /** Estado & refs */
  const [colorName, setColorName] = useState('')
  const soundRef = useRef<Audio.Sound | null>(null)

  /** Dimensões */
  const { height: windowHeight } = useWindowDimensions()

  /** Animations (Reanimated) */
  const overlayOpacity = useSharedValue(0)
  const overlayScale = useSharedValue(1)
  const overlayColor = useSharedValue('#000')

  /** Navegação Android */
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden')
      NavigationBar.setBehaviorAsync('overlay-swipe')
      NavigationBar.setBackgroundColorAsync('#00000000')
      NavigationBar.setButtonStyleAsync('light')
    }
  }, [])

  /** Som */
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

  /** Multi‑touch fairness refs */
  const firstTouchInfo = useRef<{ time: number; y: number } | null>(null)
  const decisionMade = useRef(false)
  const decisionTimer = useRef<NodeJS.Timeout | null>(null)

  /** Helpers */
  const decideWinner = () => {
    if (decisionMade.current || !firstTouchInfo.current) return
    decisionMade.current = true

    const { y } = firstTouchInfo.current
    const winnerColor = y < windowHeight / 2 ? PURPLE_COLOR : GREEN_COLOR
    const winnerName = y < windowHeight / 2 ? 'Lilás' : 'Verde'

    setColorName(winnerName)
    overlayColor.value = winnerColor
    overlayScale.value = 0.8
    overlayOpacity.value = 0
    overlayOpacity.value = withTiming(1, { duration: 180 })
    overlayScale.value = withTiming(1, { duration: 180 })
    soundRef.current?.replayAsync()

    // esconder após 2 s
    setTimeout(() => {
      overlayOpacity.value = withTiming(0, { duration: 180 })
      overlayScale.value = withTiming(0.8, { duration: 180 })
      setTimeout(() => {
        setColorName('')
      }, 200)
      // reset controles
      firstTouchInfo.current = null
      decisionMade.current = false
    }, 2000)
  }

  /** onTouchStart captura TODOS os dedos */
  const handleTouchStart = (e: GestureResponderEvent) => {
    const { pageY, timestamp } = e.nativeEvent as any // timestamp android only; iOS approximated

    // Se ainda não registramos o primeiro toque, ou este veio antes do atual registrado
    if (!firstTouchInfo.current || timestamp < firstTouchInfo.current.time) {
      firstTouchInfo.current = { time: timestamp, y: pageY }
    }

    // arma o timer apenas uma vez (primeiro toque)
    if (!decisionTimer.current) {
      decisionTimer.current = setTimeout(() => {
        decideWinner()
        decisionTimer.current = null
      }, DECISION_WINDOW)
    }
  }

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
    backgroundColor: overlayColor.value,
    transform: [{ scale: overlayScale.value }],
  }))

  /** Render */
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style='light' hidden />

      <View
        style={styles.touchZone}
        onStartShouldSetResponder={() => true}
        onResponderGrant={handleTouchStart}
      >
        {/* Metade superior */}
        <View style={[styles.halfScreen, { backgroundColor: PURPLE_COLOR }]}>
          <Text style={[styles.buttonText, styles.topText]}>Lilás</Text>
        </View>
        {/* Metade inferior */}
        <View style={[styles.halfScreen, { backgroundColor: GREEN_COLOR }]}>
          <Text style={[styles.buttonText, styles.bottomText]}>Verde</Text>
        </View>
      </View>

      {/* Overlay de resultado */}
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
  touchZone: {
    flex: 1,
  },
  halfScreen: {
    flex: 1,
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
