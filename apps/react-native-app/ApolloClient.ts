import {ApolloClient, createHttpLink, InMemoryCache} from '@apollo/client';
import {setContext} from '@apollo/client/link/context';
import {onError} from '@apollo/client/link/error';
import {createPersistedQueryLink} from '@apollo/client/link/persisted-queries';
import {RetryLink} from '@apollo/client/link/retry';

import {relayStylePagination} from '@apollo/client/utilities';

import Config from 'react-native-config';
import {useGlobalStore} from './Store';
import {
  AsyncStorageWrapper,
  MMKVStorageWrapper,
  MMKVWrapper,
  persistCache,
} from 'apollo3-cache-persist';
import {storage} from '@utils/Storage';

let client: ApolloClient<any>;

const httpLink = createHttpLink({
  uri: Config.API_URL,
});

const authLink = setContext((_, {headers}) => {
  const authToken = useGlobalStore.getState().authToken;

  return {
    headers: {
      ...headers,
      ...(authToken ? {Authorization: `Bearer ${authToken}`} : {}),
    },
  };
});

const errorLink = onError(({graphQLErrors, networkError}) => {
  // if (graphQLErrors) {
  //   graphQLErrors.map(err => console.log(err));
  // }

  if (graphQLErrors && graphQLErrors.length > 0) {
    const errorCode = graphQLErrors[0].message.toLowerCase();

    if (errorCode === 'unauthorized' || errorCode === 'unauthorised') {
      if (graphQLErrors[0].message[0] !== 'me') {
        console.log('API authentication error, logging out user');

        // store.dispatch(logout());

        return;
      }
    }

    // console.log(errorCode);
  }

  if (networkError) {
    // console.log('Network error occurred', { networkError })
  }
});

const retryLink = new RetryLink();

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        searchMedications: relayStylePagination(),
      },
    },
  },
});

export const createApolloClient = async () => {
  await persistCache({
    cache,
    storage: new MMKVWrapper(storage),
  });

  client = new ApolloClient({
    link: errorLink.concat(retryLink.concat(authLink.concat(httpLink))),
    cache: cache,
  });

  return client;
};

export function updateClientHeaders(token: string) {
  const authLink = setContext((_, {headers}) => {
    return {
      headers: {
        ...headers,
        authorization: token ? `Bearer ${token}` : '',
      },
    };
  });

  client.setLink(authLink.concat(httpLink));
}

createApolloClient();