type SignUpStackParamList = {
  SIGN_UP_SCREEN: undefined;
  'Profile Onboarding Stack': {email: string};
};

type SignUpScreenNavigationProp = {
  navigate: <T extends keyof SignUpStackParamList>(
    screen: T,
    params: SignUpStackParamList[T],
  ) => void;
};
