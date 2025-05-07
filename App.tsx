import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { View, Text, SafeAreaView, TouchableOpacity } from 'react-native'

export default function App() {
  const [overlay, setOverlay] = useState<{
    color: string
    name: string
    backgroundColor: string
  } | null>(null)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    if (overlay) {
      timer = setTimeout(() => {
        setOverlay(null)
      }, 5000)
    }

    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [overlay])

  const handlePress = (color: string, name: string) => {
    setOverlay({ color, name, backgroundColor: color })
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {overlay ? (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 10,
            backgroundColor: overlay.backgroundColor,
          }}
        >
          <Text
            style={{
              fontSize: 36,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
            }}
          >
            {overlay.name}
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#9370db',
            }}
            onPress={() => handlePress('#9370DB', 'Lilás')}
          >
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>
              Lilás
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: '#2e8b57',
            }}
            onPress={() => handlePress('#2E8B57', 'Verde')}
          >
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'white' }}>
              Verde
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  )
}
