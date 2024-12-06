import { gql } from '@apollo/client';
import * as ApolloReactCommon from '@apollo/client';
import * as ApolloReactHooks from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  Time: any;
};

export type AddMyMedicationInput = {
  dosageStrength?: InputMaybe<Scalars['String']>;
  medicationId?: InputMaybe<Scalars['String']>;
  name?: InputMaybe<Scalars['String']>;
};

export type CreateAccountInput = {
  email: Scalars['String'];
  password: Scalars['String'];
};

export type LoginInput = {
  email: Scalars['String'];
  password: Scalars['String'];
};

/** Represents a medication. */
export type Medication = {
  __typename?: 'Medication';
  /** The generic name of the medication. E.g. Acetaminophen. */
  activeIngredient: Scalars['String'];
  /** The brand name of the medication. E.g. Tylenol. */
  brandName: Scalars['String'];
  id: Scalars['ID'];
  strength?: Maybe<Scalars['String']>;
};

export type MedicationEdge = {
  __typename?: 'MedicationEdge';
  cursor: Scalars['String'];
  node: Medication;
};

export type MedicationsConnection = {
  __typename?: 'MedicationsConnection';
  edges: Array<MedicationEdge>;
  pageInfo: PageInfo;
};

export type Mutation = {
  __typename?: 'Mutation';
  addFcmToken: Scalars['Boolean'];
  addMyMedication: MyMedication;
  createAccount: Session;
  login: Session;
};


export type MutationAddFcmTokenArgs = {
  token: Scalars['String'];
};


export type MutationAddMyMedicationArgs = {
  input: AddMyMedicationInput;
};


export type MutationCreateAccountArgs = {
  input: CreateAccountInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};

/** Represents a medication that a user is taking. */
export type MyMedication = {
  __typename?: 'MyMedication';
  activeIngredient: Scalars['String'];
  brandName: Scalars['String'];
  consumptionTime: Scalars['Time'];
  dosageStrength: Scalars['String'];
  id: Scalars['ID'];
  user: User;
};

export type MyMedicationEdge = {
  __typename?: 'MyMedicationEdge';
  cursor: Scalars['String'];
  node: MyMedication;
};

export type MyMedicationsConnection = {
  __typename?: 'MyMedicationsConnection';
  edges: Array<MyMedicationEdge>;
  pageInfo: PageInfo;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor: Scalars['ID'];
  hasNextPage?: Maybe<Scalars['Boolean']>;
  startCursor: Scalars['ID'];
};

export type Query = {
  __typename?: 'Query';
  /** Get all medications that a user is taking. */
  myMedications: Array<MyMedicationEdge>;
  /** Search for medications in the global library by name. */
  searchMedications: MedicationsConnection;
};


export type QuerySearchMedicationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  query: Scalars['String'];
};

export type Session = {
  __typename?: 'Session';
  token?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
};

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  id: Scalars['ID'];
};

export type AddMyMedicationMutationVariables = Exact<{
  input: AddMyMedicationInput;
}>;


export type AddMyMedicationMutation = { __typename?: 'Mutation', addMyMedication: { __typename?: 'MyMedication', id: string, brandName: string, activeIngredient: string, dosageStrength: string, user: { __typename?: 'User', id: string } } };

export type SearchMedicationsQueryVariables = Exact<{
  query: Scalars['String'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type SearchMedicationsQuery = { __typename?: 'Query', searchMedications: { __typename?: 'MedicationsConnection', pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, endCursor: string }, edges: Array<{ __typename?: 'MedicationEdge', node: { __typename?: 'Medication', id: string, activeIngredient: string, brandName: string, strength?: string | null } }> } };

export type LoginMutationVariables = Exact<{
  input: LoginInput;
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'Session', token?: string | null, user?: { __typename?: 'User', id: string, email: string } | null } };

export type AddFcmTokenMutationVariables = Exact<{
  token: Scalars['String'];
}>;


export type AddFcmTokenMutation = { __typename?: 'Mutation', addFcmToken: boolean };

export type CreateAccountMutationVariables = Exact<{
  input: CreateAccountInput;
}>;


export type CreateAccountMutation = { __typename?: 'Mutation', createAccount: { __typename?: 'Session', token?: string | null, user?: { __typename?: 'User', id: string, email: string } | null } };

export type MyMedicationBaseFragment = { __typename?: 'MyMedication', id: string, brandName: string, activeIngredient: string, dosageStrength: string, user: { __typename?: 'User', id: string } };

export const MyMedicationBaseFragmentDoc = gql`
    fragment MyMedicationBase on MyMedication {
  id
  user {
    id
  }
  brandName
  activeIngredient
  dosageStrength
}
    `;
export const AddMyMedicationDocument = gql`
    mutation AddMyMedication($input: AddMyMedicationInput!) {
  addMyMedication(input: $input) {
    ...MyMedicationBase
  }
}
    ${MyMedicationBaseFragmentDoc}`;
export type AddMyMedicationMutationFn = ApolloReactCommon.MutationFunction<AddMyMedicationMutation, AddMyMedicationMutationVariables>;

/**
 * __useAddMyMedicationMutation__
 *
 * To run a mutation, you first call `useAddMyMedicationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddMyMedicationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addMyMedicationMutation, { data, loading, error }] = useAddMyMedicationMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddMyMedicationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<AddMyMedicationMutation, AddMyMedicationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<AddMyMedicationMutation, AddMyMedicationMutationVariables>(AddMyMedicationDocument, options);
      }
export type AddMyMedicationMutationHookResult = ReturnType<typeof useAddMyMedicationMutation>;
export type AddMyMedicationMutationResult = ApolloReactCommon.MutationResult<AddMyMedicationMutation>;
export type AddMyMedicationMutationOptions = ApolloReactCommon.BaseMutationOptions<AddMyMedicationMutation, AddMyMedicationMutationVariables>;
export const SearchMedicationsDocument = gql`
    query SearchMedications($query: String!, $after: String) {
  searchMedications(query: $query, after: $after) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        activeIngredient
        brandName
        strength
      }
    }
  }
}
    `;

/**
 * __useSearchMedicationsQuery__
 *
 * To run a query within a React component, call `useSearchMedicationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSearchMedicationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSearchMedicationsQuery({
 *   variables: {
 *      query: // value for 'query'
 *      after: // value for 'after'
 *   },
 * });
 */
export function useSearchMedicationsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<SearchMedicationsQuery, SearchMedicationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<SearchMedicationsQuery, SearchMedicationsQueryVariables>(SearchMedicationsDocument, options);
      }
export function useSearchMedicationsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<SearchMedicationsQuery, SearchMedicationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<SearchMedicationsQuery, SearchMedicationsQueryVariables>(SearchMedicationsDocument, options);
        }
export type SearchMedicationsQueryHookResult = ReturnType<typeof useSearchMedicationsQuery>;
export type SearchMedicationsLazyQueryHookResult = ReturnType<typeof useSearchMedicationsLazyQuery>;
export type SearchMedicationsQueryResult = ApolloReactCommon.QueryResult<SearchMedicationsQuery, SearchMedicationsQueryVariables>;
export const LoginDocument = gql`
    mutation login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      email
    }
  }
}
    `;
export type LoginMutationFn = ApolloReactCommon.MutationFunction<LoginMutation, LoginMutationVariables>;

/**
 * __useLoginMutation__
 *
 * To run a mutation, you first call `useLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [loginMutation, { data, loading, error }] = useLoginMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useLoginMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<LoginMutation, LoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<LoginMutation, LoginMutationVariables>(LoginDocument, options);
      }
export type LoginMutationHookResult = ReturnType<typeof useLoginMutation>;
export type LoginMutationResult = ApolloReactCommon.MutationResult<LoginMutation>;
export type LoginMutationOptions = ApolloReactCommon.BaseMutationOptions<LoginMutation, LoginMutationVariables>;
export const AddFcmTokenDocument = gql`
    mutation addFcmToken($token: String!) {
  addFcmToken(token: $token)
}
    `;
export type AddFcmTokenMutationFn = ApolloReactCommon.MutationFunction<AddFcmTokenMutation, AddFcmTokenMutationVariables>;

/**
 * __useAddFcmTokenMutation__
 *
 * To run a mutation, you first call `useAddFcmTokenMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddFcmTokenMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addFcmTokenMutation, { data, loading, error }] = useAddFcmTokenMutation({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useAddFcmTokenMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<AddFcmTokenMutation, AddFcmTokenMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<AddFcmTokenMutation, AddFcmTokenMutationVariables>(AddFcmTokenDocument, options);
      }
export type AddFcmTokenMutationHookResult = ReturnType<typeof useAddFcmTokenMutation>;
export type AddFcmTokenMutationResult = ApolloReactCommon.MutationResult<AddFcmTokenMutation>;
export type AddFcmTokenMutationOptions = ApolloReactCommon.BaseMutationOptions<AddFcmTokenMutation, AddFcmTokenMutationVariables>;
export const CreateAccountDocument = gql`
    mutation createAccount($input: CreateAccountInput!) {
  createAccount(input: $input) {
    user {
      id
      email
    }
    token
  }
}
    `;
export type CreateAccountMutationFn = ApolloReactCommon.MutationFunction<CreateAccountMutation, CreateAccountMutationVariables>;

/**
 * __useCreateAccountMutation__
 *
 * To run a mutation, you first call `useCreateAccountMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAccountMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAccountMutation, { data, loading, error }] = useCreateAccountMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateAccountMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateAccountMutation, CreateAccountMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateAccountMutation, CreateAccountMutationVariables>(CreateAccountDocument, options);
      }
export type CreateAccountMutationHookResult = ReturnType<typeof useCreateAccountMutation>;
export type CreateAccountMutationResult = ApolloReactCommon.MutationResult<CreateAccountMutation>;
export type CreateAccountMutationOptions = ApolloReactCommon.BaseMutationOptions<CreateAccountMutation, CreateAccountMutationVariables>;