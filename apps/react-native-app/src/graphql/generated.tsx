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

export type AddMedicationScheduleInput = {
  daysOfWeek?: InputMaybe<Array<InputMaybe<Scalars['String']>>>;
  dosesRemaining?: InputMaybe<Scalars['Int']>;
  endDate?: InputMaybe<Scalars['Time']>;
  intervalsDays?: InputMaybe<Scalars['Int']>;
  intervalsHours?: InputMaybe<Scalars['Int']>;
  medicationId?: InputMaybe<Scalars['ID']>;
  methodType?: InputMaybe<MethodScheduleType>;
  myMedicationId?: InputMaybe<Scalars['ID']>;
  pauseForDays?: InputMaybe<Scalars['Int']>;
  pauseForHours?: InputMaybe<Scalars['Int']>;
  recurringType?: InputMaybe<RecurringScheduleType>;
  refillsRemaining?: InputMaybe<Scalars['Int']>;
  startDate?: InputMaybe<Scalars['Time']>;
  timeSlots?: InputMaybe<Array<InputMaybe<Scalars['Time']>>>;
  useForDays?: InputMaybe<Scalars['Int']>;
  useForHours?: InputMaybe<Scalars['Int']>;
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

export type MedicationLogEntry = {
  __typename?: 'MedicationLogEntry';
  dueTime: Scalars['Time'];
  id: Scalars['ID'];
  myMedication: MyMedication;
  status: MedicationLogEntryStatus;
  takenTime: Scalars['String'];
};

export enum MedicationLogEntryStatus {
  Missed = 'MISSED',
  Taken = 'TAKEN',
  Upcoming = 'UPCOMING'
}

export type MedicationsConnection = {
  __typename?: 'MedicationsConnection';
  edges: Array<MedicationEdge>;
  pageInfo: PageInfo;
};

/** Represents the type of method schedule for a Medication Schedule. For e.g. some are taken on certain days (Mon, Tues, Fri), intervals (every X days), periods (use for X days, pause for X days), or taken as needed/no schedule. */
export enum MethodScheduleType {
  Days = 'DAYS',
  Intervals = 'INTERVALS',
  Periods = 'PERIODS',
  WhenNeeded = 'WHEN_NEEDED'
}

export type Mutation = {
  __typename?: 'Mutation';
  addFcmToken: Scalars['Boolean'];
  addMyMedication: MyMedication;
  createAccount: Session;
  createMedicationSchedule: Scalars['Boolean'];
  login: Session;
  tagScanned: Scalars['Boolean'];
  updateMedicationTagLinked: Scalars['Boolean'];
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


export type MutationCreateMedicationScheduleArgs = {
  input: AddMedicationScheduleInput;
};


export type MutationLoginArgs = {
  input: LoginInput;
};


export type MutationTagScannedArgs = {
  input: TagScannedInput;
};


export type MutationUpdateMedicationTagLinkedArgs = {
  input: UpdateMedicationTagLinkedInput;
};

/** Represents a medication that a user is taking. */
export type MyMedication = {
  __typename?: 'MyMedication';
  activeIngredient?: Maybe<Scalars['String']>;
  brandName: Scalars['String'];
  dosageStrength: Scalars['String'];
  id: Scalars['ID'];
  isTagLinked?: Maybe<Scalars['Boolean']>;
  schedule?: Maybe<MyMedicationSchedule>;
  user: User;
};

export type MyMedicationEdge = {
  __typename?: 'MyMedicationEdge';
  cursor: Scalars['String'];
  node: MyMedication;
};

export type MyMedicationSchedule = {
  __typename?: 'MyMedicationSchedule';
  dosesRemaining?: Maybe<Scalars['Int']>;
  id: Scalars['ID'];
  /** The number of days the medication is taken each week. E.g. Every Day, Weekly, Every Other Day or Mon, Tues, Fri. */
  scheduledDays?: Maybe<Scalars['String']>;
  timesPerDay?: Maybe<Scalars['Int']>;
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
  medicationLogEntries?: Maybe<Array<MedicationLogEntry>>;
  /** Get all medications that a user is taking. */
  myMedications: MyMedicationsConnection;
  /** Search for medications in the global library by name. */
  searchMedications: MedicationsConnection;
};


export type QueryMedicationLogEntriesArgs = {
  date: Scalars['Time'];
};


export type QueryMyMedicationsArgs = {
  after?: InputMaybe<Scalars['String']>;
};


export type QuerySearchMedicationsArgs = {
  after?: InputMaybe<Scalars['String']>;
  query: Scalars['String'];
};

/** Represents the type of recurring schedule for a Medication Schedule. For e.g. some are taken in time slots (e.g. 8am, 12pm, 6pm), intervals (every X hours) or periods (use for X days, pause for X days). */
export enum RecurringScheduleType {
  Intervals = 'INTERVALS',
  Periods = 'PERIODS',
  Time = 'TIME',
  WhenNeeded = 'WHEN_NEEDED'
}

export type Session = {
  __typename?: 'Session';
  token?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
};

export type TagScannedInput = {
  medicationId: Scalars['ID'];
};

export type UpdateMedicationTagLinkedInput = {
  isTagLinked: Scalars['Boolean'];
  myMedicationId: Scalars['ID'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  id: Scalars['ID'];
};

export type AddMedicationScheduleMutationVariables = Exact<{
  input: AddMedicationScheduleInput;
}>;


export type AddMedicationScheduleMutation = { __typename?: 'Mutation', createMedicationSchedule: boolean };

export type AddMyMedicationMutationVariables = Exact<{
  input: AddMyMedicationInput;
}>;


export type AddMyMedicationMutation = { __typename?: 'Mutation', addMyMedication: { __typename?: 'MyMedication', id: string, brandName: string, activeIngredient?: string | null, dosageStrength: string, isTagLinked?: boolean | null, user: { __typename?: 'User', id: string } } };

export type SearchMedicationsQueryVariables = Exact<{
  query: Scalars['String'];
  after?: InputMaybe<Scalars['String']>;
}>;


export type SearchMedicationsQuery = { __typename?: 'Query', searchMedications: { __typename?: 'MedicationsConnection', pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, endCursor: string }, edges: Array<{ __typename?: 'MedicationEdge', node: { __typename?: 'Medication', id: string, activeIngredient: string, brandName: string, strength?: string | null } }> } };

export type MedicationLogHistoryQueryVariables = Exact<{
  date: Scalars['Time'];
}>;


export type MedicationLogHistoryQuery = { __typename?: 'Query', medicationLogEntries?: Array<{ __typename?: 'MedicationLogEntry', id: string, takenTime: string, dueTime: any, status: MedicationLogEntryStatus, myMedication: { __typename?: 'MyMedication', id: string, brandName: string, activeIngredient?: string | null, dosageStrength: string, isTagLinked?: boolean | null, user: { __typename?: 'User', id: string } } }> | null };

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

export type MyMedicationsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']>;
}>;


export type MyMedicationsQuery = { __typename?: 'Query', myMedications: { __typename?: 'MyMedicationsConnection', edges: Array<{ __typename?: 'MyMedicationEdge', node: { __typename?: 'MyMedication', id: string, brandName: string, activeIngredient?: string | null, dosageStrength: string, isTagLinked?: boolean | null, schedule?: { __typename?: 'MyMedicationSchedule', id: string, scheduledDays?: string | null, timesPerDay?: number | null, dosesRemaining?: number | null } | null, user: { __typename?: 'User', id: string } } }>, pageInfo: { __typename?: 'PageInfo', endCursor: string, hasNextPage?: boolean | null } } };

export type OnTagScannedMutationVariables = Exact<{
  input: TagScannedInput;
}>;


export type OnTagScannedMutation = { __typename?: 'Mutation', tagScanned: boolean };

export type UpdateMedicationTagLinkedMutationVariables = Exact<{
  input: UpdateMedicationTagLinkedInput;
}>;


export type UpdateMedicationTagLinkedMutation = { __typename?: 'Mutation', updateMedicationTagLinked: boolean };

export type MyMedicationBaseFragment = { __typename?: 'MyMedication', id: string, brandName: string, activeIngredient?: string | null, dosageStrength: string, isTagLinked?: boolean | null, user: { __typename?: 'User', id: string } };

export const MyMedicationBaseFragmentDoc = gql`
    fragment MyMedicationBase on MyMedication {
  id
  user {
    id
  }
  brandName
  activeIngredient
  dosageStrength
  isTagLinked
}
    `;
export const AddMedicationScheduleDocument = gql`
    mutation AddMedicationSchedule($input: AddMedicationScheduleInput!) {
  createMedicationSchedule(input: $input)
}
    `;
export type AddMedicationScheduleMutationFn = ApolloReactCommon.MutationFunction<AddMedicationScheduleMutation, AddMedicationScheduleMutationVariables>;

/**
 * __useAddMedicationScheduleMutation__
 *
 * To run a mutation, you first call `useAddMedicationScheduleMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddMedicationScheduleMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addMedicationScheduleMutation, { data, loading, error }] = useAddMedicationScheduleMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddMedicationScheduleMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<AddMedicationScheduleMutation, AddMedicationScheduleMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<AddMedicationScheduleMutation, AddMedicationScheduleMutationVariables>(AddMedicationScheduleDocument, options);
      }
export type AddMedicationScheduleMutationHookResult = ReturnType<typeof useAddMedicationScheduleMutation>;
export type AddMedicationScheduleMutationResult = ApolloReactCommon.MutationResult<AddMedicationScheduleMutation>;
export type AddMedicationScheduleMutationOptions = ApolloReactCommon.BaseMutationOptions<AddMedicationScheduleMutation, AddMedicationScheduleMutationVariables>;
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
export const MedicationLogHistoryDocument = gql`
    query MedicationLogHistory($date: Time!) {
  medicationLogEntries(date: $date) {
    id
    myMedication {
      ...MyMedicationBase
    }
    takenTime
    dueTime
    status
  }
}
    ${MyMedicationBaseFragmentDoc}`;

/**
 * __useMedicationLogHistoryQuery__
 *
 * To run a query within a React component, call `useMedicationLogHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useMedicationLogHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMedicationLogHistoryQuery({
 *   variables: {
 *      date: // value for 'date'
 *   },
 * });
 */
export function useMedicationLogHistoryQuery(baseOptions: ApolloReactHooks.QueryHookOptions<MedicationLogHistoryQuery, MedicationLogHistoryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MedicationLogHistoryQuery, MedicationLogHistoryQueryVariables>(MedicationLogHistoryDocument, options);
      }
export function useMedicationLogHistoryLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MedicationLogHistoryQuery, MedicationLogHistoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MedicationLogHistoryQuery, MedicationLogHistoryQueryVariables>(MedicationLogHistoryDocument, options);
        }
export type MedicationLogHistoryQueryHookResult = ReturnType<typeof useMedicationLogHistoryQuery>;
export type MedicationLogHistoryLazyQueryHookResult = ReturnType<typeof useMedicationLogHistoryLazyQuery>;
export type MedicationLogHistoryQueryResult = ApolloReactCommon.QueryResult<MedicationLogHistoryQuery, MedicationLogHistoryQueryVariables>;
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
export const MyMedicationsDocument = gql`
    query MyMedications($after: String) {
  myMedications(after: $after) {
    edges {
      node {
        ...MyMedicationBase
        schedule {
          id
          scheduledDays
          timesPerDay
          dosesRemaining
        }
      }
    }
    pageInfo {
      endCursor
      hasNextPage
    }
  }
}
    ${MyMedicationBaseFragmentDoc}`;

/**
 * __useMyMedicationsQuery__
 *
 * To run a query within a React component, call `useMyMedicationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyMedicationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyMedicationsQuery({
 *   variables: {
 *      after: // value for 'after'
 *   },
 * });
 */
export function useMyMedicationsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MyMedicationsQuery, MyMedicationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MyMedicationsQuery, MyMedicationsQueryVariables>(MyMedicationsDocument, options);
      }
export function useMyMedicationsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MyMedicationsQuery, MyMedicationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MyMedicationsQuery, MyMedicationsQueryVariables>(MyMedicationsDocument, options);
        }
export type MyMedicationsQueryHookResult = ReturnType<typeof useMyMedicationsQuery>;
export type MyMedicationsLazyQueryHookResult = ReturnType<typeof useMyMedicationsLazyQuery>;
export type MyMedicationsQueryResult = ApolloReactCommon.QueryResult<MyMedicationsQuery, MyMedicationsQueryVariables>;
export const OnTagScannedDocument = gql`
    mutation onTagScanned($input: TagScannedInput!) {
  tagScanned(input: $input)
}
    `;
export type OnTagScannedMutationFn = ApolloReactCommon.MutationFunction<OnTagScannedMutation, OnTagScannedMutationVariables>;

/**
 * __useOnTagScannedMutation__
 *
 * To run a mutation, you first call `useOnTagScannedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useOnTagScannedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [onTagScannedMutation, { data, loading, error }] = useOnTagScannedMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useOnTagScannedMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<OnTagScannedMutation, OnTagScannedMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<OnTagScannedMutation, OnTagScannedMutationVariables>(OnTagScannedDocument, options);
      }
export type OnTagScannedMutationHookResult = ReturnType<typeof useOnTagScannedMutation>;
export type OnTagScannedMutationResult = ApolloReactCommon.MutationResult<OnTagScannedMutation>;
export type OnTagScannedMutationOptions = ApolloReactCommon.BaseMutationOptions<OnTagScannedMutation, OnTagScannedMutationVariables>;
export const UpdateMedicationTagLinkedDocument = gql`
    mutation updateMedicationTagLinked($input: UpdateMedicationTagLinkedInput!) {
  updateMedicationTagLinked(input: $input)
}
    `;
export type UpdateMedicationTagLinkedMutationFn = ApolloReactCommon.MutationFunction<UpdateMedicationTagLinkedMutation, UpdateMedicationTagLinkedMutationVariables>;

/**
 * __useUpdateMedicationTagLinkedMutation__
 *
 * To run a mutation, you first call `useUpdateMedicationTagLinkedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateMedicationTagLinkedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateMedicationTagLinkedMutation, { data, loading, error }] = useUpdateMedicationTagLinkedMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateMedicationTagLinkedMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateMedicationTagLinkedMutation, UpdateMedicationTagLinkedMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateMedicationTagLinkedMutation, UpdateMedicationTagLinkedMutationVariables>(UpdateMedicationTagLinkedDocument, options);
      }
export type UpdateMedicationTagLinkedMutationHookResult = ReturnType<typeof useUpdateMedicationTagLinkedMutation>;
export type UpdateMedicationTagLinkedMutationResult = ApolloReactCommon.MutationResult<UpdateMedicationTagLinkedMutation>;
export type UpdateMedicationTagLinkedMutationOptions = ApolloReactCommon.BaseMutationOptions<UpdateMedicationTagLinkedMutation, UpdateMedicationTagLinkedMutationVariables>;