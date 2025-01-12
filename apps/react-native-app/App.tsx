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
import {useGlobalStore} from '@store';
import {extractMedicationIdFromUrl} from '@utils/Helpers';
import TagScannedModal from '@components/TagScannedModal';
import BootSplash from 'react-native-bootsplash';

enableScreens(true);
enableFreeze(true);

function App() {
  const [apolloClient, setApolloClient] = useState<ApolloClient<any>>();
  const {setTagScanned, tagScanned, appReady, setAppReady} = useGlobalStore(
    state => state,
  );

  useEffect(() => {
    const createClient = async () => {
      const client = await createApolloClient();
      setApolloClient(client);
    };

    setAppReady(false);
    createClient();
  }, []);

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();

      if (initialUrl) {
        const medicationId = extractMedicationIdFromUrl(initialUrl);

        if (medicationId !== '') {
          setTagScanned(medicationId);
        }
      }
    };

    getUrlAsync();

    Linking.addEventListener('url', event => {
      if (event.url) {
        const medicationId = extractMedicationIdFromUrl(event.url);

        console.log(medicationId);

        if (medicationId !== '') {
          setTagScanned(medicationId);
        }
      }
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
                {tagScanned && appReady && <TagScannedModal />}
              </BottomSheetModalProvider>
            </PortalProvider>
          </GestureHandlerRootView>
        </NavigationContainer>
      </SafeAreaProvider>
    </ApolloProvider>
  );
}

export default App;
