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
  consumptionTime: Scalars['Time'];
  dosageStrength: Scalars['String'];
  medicationId: Scalars['String'];
};

/** Represents a medication. */
export type Medication = {
  __typename?: 'Medication';
  /** The generic name of the medication. E.g. Acetaminophen. */
  activeIngredient: Scalars['String'];
  /** The brand name of the medication. E.g. Tylenol. */
  brandName: Scalars['String'];
  /** The forms of the medication. E.g. Capsule. */
  dosageForms: Array<Maybe<Scalars['String']>>;
  id: Scalars['ID'];
  strengthsAvailable?: Maybe<Array<Scalars['String']>>;
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
  addMyMedication: MyMedication;
};


export type MutationAddMyMedicationArgs = {
  input: AddMyMedicationInput;
};

/** Represents a medication that a user is taking. */
export type MyMedication = {
  __typename?: 'MyMedication';
  consumptionTime: Scalars['Time'];
  dosageStrength: Scalars['String'];
  id: Scalars['ID'];
  medication: Medication;
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
  query: Scalars['String'];
};

export type User = {
  __typename?: 'User';
  email: Scalars['String'];
  id: Scalars['ID'];
  name: Scalars['String'];
};

export type AddMyMedicationMutationVariables = Exact<{
  input: AddMyMedicationInput;
}>;


export type AddMyMedicationMutation = { __typename?: 'Mutation', addMyMedication: { __typename?: 'MyMedication', medication: { __typename?: 'Medication', id: string } } };

export type SearchMedicationsQueryVariables = Exact<{
  query: Scalars['String'];
}>;


export type SearchMedicationsQuery = { __typename?: 'Query', searchMedications: { __typename?: 'MedicationsConnection', pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, endCursor: string }, edges: Array<{ __typename?: 'MedicationEdge', node: { __typename?: 'Medication', id: string, activeIngredient: string, brandName: string, dosageForms: Array<string | null>, strengthsAvailable?: Array<string> | null } }> } };


export const AddMyMedicationDocument = gql`
    mutation AddMyMedication($input: AddMyMedicationInput!) {
  addMyMedication(input: $input) {
    medication {
      id
    }
  }
}
    `;
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
    query SearchMedications($query: String!) {
  searchMedications(query: $query) {
    pageInfo {
      hasNextPage
      endCursor
    }
    edges {
      node {
        id
        activeIngredient
        brandName
        dosageForms
        strengthsAvailable
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