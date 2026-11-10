// Copyright 2026 VENSOLUTIONSGROUP LTD
// SPDX-License-Identifier: Apache-2.0
import { useContext, useEffect, type RefObject } from 'react';
import { UNSAFE_DataRouterContext, useBlocker } from 'react-router';

const RouteGuard = ({ dirty, allowNavigation }: { dirty: boolean; allowNavigation?: RefObject<boolean> }) => {
  const blocker = useBlocker(() => dirty && !allowNavigation?.current);
  useEffect(() => {
    if (blocker.state !== 'blocked') return;
    if (window.confirm('Discard unsaved scenario changes?')) blocker.proceed();
    else blocker.reset();
  }, [blocker]);
  return null;
};
export const ScenarioDraftNavigationGuard = ({ dirty, allowNavigation }: { dirty: boolean; allowNavigation?: RefObject<boolean> }) => {
  const router = useContext(UNSAFE_DataRouterContext);
  useEffect(() => {
    const guard = (event: Event) => {
      if (dirty && !allowNavigation?.current && !window.confirm('Discard unsaved scenario changes?')) event.preventDefault();
    };
    window.addEventListener('testportal:project-change', guard);
    return () => window.removeEventListener('testportal:project-change', guard);
  }, [dirty, allowNavigation]);
  return router ? <RouteGuard dirty={dirty} allowNavigation={allowNavigation} /> : null;
};
