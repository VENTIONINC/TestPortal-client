// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { useContext, useEffect } from 'react';
import { UNSAFE_DataRouterContext, useBlocker } from 'react-router';

const RouteGuard = ({ dirty }: { dirty: boolean }) => {
  const blocker = useBlocker(dirty);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('Discard unsaved scenario changes?')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);
  return null;
};
export const ScenarioDraftNavigationGuard = ({ dirty }: { dirty: boolean }) => {
  const router = useContext(UNSAFE_DataRouterContext);
  useEffect(() => {
    const guard = (event: Event) => {
      if (dirty && !window.confirm('Discard unsaved scenario changes?')) event.preventDefault();
    };
    window.addEventListener('testportal:project-change', guard);
    return () => window.removeEventListener('testportal:project-change', guard);
  }, [dirty]);
  return router ? <RouteGuard dirty={dirty} /> : null;
};
