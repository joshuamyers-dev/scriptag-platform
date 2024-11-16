import {ApolloProvider} from '@apollo/client';
import MainStack from '@navigators/MainStack';
import {NavigationContainer} from '@react-navigation/native';
import client from './ApolloClient';
import React, {useCallback, useEffect} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import {
  enableFreeze,
  enableScreens,
  FullWindowOverlay,
} from 'react-native-screens';
import {Linking} from 'react-native';
import {PortalProvider} from '@gorhom/portal';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import ToastMessage from '@components/Toast';
import {firebase} from '@react-native-firebase/messaging';

enableScreens(true);
enableFreeze(true);

function App() {
  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();

      console.log(initialUrl);

      Toast.show({
        type: 'success',
        text1: 'Medication Taken!',
        text2: 'Your Lexapro has been taken successfully!',
      });
    };

    getUrlAsync();

    Linking.addEventListener('url', event => {
      console.log(event);

      Toast.show({
        type: 'success',
        text1: 'Medication Taken!',
        text2: 'Your Lexapro has been taken successfully!',
      });
    });
  }, []);

  return (
    <ApolloProvider client={client}>
      <SafeAreaProvider>
        <NavigationContainer>
          <GestureHandlerRootView>
            <PortalProvider>
              <MainStack />
              <FullWindowOverlay>
                <ToastMessage />
              </FullWindowOverlay>
            </PortalProvider>
          </GestureHandlerRootView>
        </NavigationContainer>
      </SafeAreaProvider>
    </ApolloProvider>
  );
}

export default App;
