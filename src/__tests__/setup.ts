// Copyright 2026 Vention
// SPDX-License-Identifier: Apache-2.0

import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
