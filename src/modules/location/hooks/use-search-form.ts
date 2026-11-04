'use client';

import { useCallback, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import {
  MIN_QUERY_LENGTH,
  SEARCH_MIN_LENGTH_MESSAGE,
  SEARCH_REQUIRED_MESSAGE,
} from '@/modules/location/constants/location.constants';
import { useGeocoding } from '@/modules/location/hooks/use-geocoding';
import type {
  ISearchFormValues,
  IUseSearchFormResult,
} from '@/modules/location/types/location.types';
import { normalizeGeocodingQuery } from '@/modules/location/utils/geocoding';

/**
 * Search form logic (SPEC §8.1): validation with React Hook Form and a query
 * that only activates on submit. Typing never calls Open-Meteo; pressing the
 * button with at least three non-blank characters does.
 */
export function useSearchForm(): IUseSearchFormResult {
  const [submittedQuery, setSubmittedQuery] = useState<string | null>(null);
  const [isResultsOpen, setIsResultsOpen] = useState(false);
  const geocoding = useGeocoding(submittedQuery);
  const form = useForm<ISearchFormValues>({
    defaultValues: { query: '' },
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
  });

  const registerQuery = form.register('query', {
    required: SEARCH_REQUIRED_MESSAGE,
    minLength: { value: MIN_QUERY_LENGTH, message: SEARCH_MIN_LENGTH_MESSAGE },
    validate: (value) =>
      normalizeGeocodingQuery(value).length >= MIN_QUERY_LENGTH || SEARCH_MIN_LENGTH_MESSAGE,
    onChange: (event: ChangeEvent<HTMLInputElement>): void => {
      form.clearErrors('query');

      if (event.currentTarget.value === '') {
        setSubmittedQuery(null);
        setIsResultsOpen(false);
      }
    },
  });

  const closeResults = useCallback((): void => {
    setIsResultsOpen(false);
  }, []);

  const onSubmit = form.handleSubmit((values) => {
    setSubmittedQuery(normalizeGeocodingQuery(values.query));
    setIsResultsOpen(true);
  });

  return {
    form,
    registerQuery,
    results: geocoding.data ?? [],
    isSearching: geocoding.isFetching,
    isError: geocoding.isError,
    hasSearched: submittedQuery !== null,
    isResultsOpen,
    closeResults,
    onSubmit,
  };
}
