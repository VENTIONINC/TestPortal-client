// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0

import { useRef, useState } from 'react';

import { getActionErrorMessage } from '../../utils';

export const useCatalogConfirmation = <T>(
  submit: () => Promise<T>,
  closeDialog: () => void,
  onComplete?: (result: T) => void,
) => {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submitInFlight = useRef(false);

  const onCancel = () => {
    if (!submitInFlight.current) closeDialog();
  };

  const onConfirm = async () => {
    if (submitInFlight.current) return;
    submitInFlight.current = true;
    setIsSubmitting(true);
    setError(null);

    let result: T;
    try {
      result = await submit();
    } catch (error) {
      setError(getActionErrorMessage(error));
      return;
    } finally {
      submitInFlight.current = false;
      setIsSubmitting(false);
    }

    closeDialog();
    onComplete?.(result);
  };

  return { error, isSubmitting, onCancel, onConfirm };
};
