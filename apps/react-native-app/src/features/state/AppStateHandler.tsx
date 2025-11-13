import {useGlobalStore} from '@store';
import {useEffect} from 'react';

import {CommonActions, useNavigation} from '@react-navigation/native';
import {ONBOARDING_SCREEN} from '@navigators/ScreenConstants';

const AppStateHandler = () => {
  const navigation = useNavigation();
  const authToken = useGlobalStore(state => state.authToken);

  useEffect(() => {
    if (!authToken) {
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{name: ONBOARDING_SCREEN}],
        }),
      );
    }
  }, [authToken, navigation]);

  return null;
};

export default AppStateHandler;
