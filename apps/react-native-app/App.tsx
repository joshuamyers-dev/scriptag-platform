import {ApolloClient, ApolloProvider} from '@apollo/client';
import ToastMessage from '@components/Toast';
import {BottomSheetModalProvider} from '@gorhom/bottom-sheet';
import {PortalProvider} from '@gorhom/portal';
import MainStack from '@navigators/MainStack';
import {NavigationContainer} from '@react-navigation/native';
import {createApolloClient} from './ApolloClient';
import React, {useEffect, useState} from 'react';
import {Linking} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {enableLayoutAnimations} from 'react-native-reanimated';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {
  enableFreeze,
  enableScreens,
  FullWindowOverlay,
} from 'react-native-screens';

enableScreens(true);
enableFreeze(true);
enableLayoutAnimations(true);

function App() {
  const [apolloClient, setApolloClient] = useState<ApolloClient<any>>();

  useEffect(() => {
    const createClient = async () => {
      const client = await createApolloClient();
      setApolloClient(client);
    };

    createClient();
  }, []);

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();

      console.log(initialUrl);
    };

    getUrlAsync();

    Linking.addEventListener('url', event => {
      console.log(event);
    });
  }, []);

  if (!apolloClient) {
    return null;
  }

  return (
    <ApolloProvider client={apolloClient}>
      <SafeAreaProvider>
        <NavigationContainer>
          <GestureHandlerRootView>
            <PortalProvider>
              <BottomSheetModalProvider>
                <MainStack />
                <FullWindowOverlay>
                  <ToastMessage />
                </FullWindowOverlay>
              </BottomSheetModalProvider>
            </PortalProvider>
          </GestureHandlerRootView>
        </NavigationContainer>
      </SafeAreaProvider>
    </ApolloProvider>
  );
}

export default App;
