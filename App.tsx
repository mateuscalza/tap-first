import { StatusBar } from 'expo-status-bar'
import { useEffect, useState } from 'react'
import { View, Text, SafeAreaView } from 'react-native'
import styled from 'styled-components/native'

const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: #fff;
`

const ButtonsContainer = styled(View)`
  flex: 1;
  flex-direction: row;
`

const Button = styled.TouchableOpacity`
  flex: 1;
  justify-content: center;
  align-items: center;
`

const LeftButton = styled(Button)`
  background-color: #9370db; /* Lilás */
`

const RightButton = styled(Button)`
  background-color: #2e8b57; /* Verde */
`

const ButtonText = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: white;
`

const Overlay = styled(View)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  justify-content: center;
  align-items: center;
  z-index: 10;
`

const OverlayText = styled.Text`
  font-size: 36px;
  font-weight: bold;
  color: white;
  text-align: center;
`

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
    <Container>
      <StatusBar style='auto' />

      {overlay ? (
        <Overlay style={{ backgroundColor: overlay.backgroundColor }}>
          <OverlayText>{overlay.name}</OverlayText>
        </Overlay>
      ) : (
        <ButtonsContainer>
          <LeftButton onPress={() => handlePress('#9370DB', 'Lilás')}>
            <ButtonText>Lilás</ButtonText>
          </LeftButton>
          <RightButton onPress={() => handlePress('#2E8B57', 'Verde')}>
            <ButtonText>Verde</ButtonText>
          </RightButton>
        </ButtonsContainer>
      )}
    </Container>
  )
}
