import { createBrowserRouter } from 'react-router';

import App from '@/App';
import { IssuesPage, LoginPage, MCPPage, NotFoundPage, ResultsPage, SignupPage } from '@/pages';
import { PATHS } from '@/types/paths';

export const router = createBrowserRouter([
  {
    path: PATHS.ROOT,
    element: <App />,
  },
  {
    path: PATHS.LOGIN,
    element: <LoginPage />,
  },
  {
    path: PATHS.SIGNUP,
    element: <SignupPage />,
  },
  {
    path: PATHS.RESULTS,
    element: <ResultsPage />,
  },
  {
    path: PATHS.ISSUES,
    element: <IssuesPage />,
  },
  {
    path: PATHS.MCP,
    element: <MCPPage />,
  },
  {
    path: PATHS.NOT_FOUND,
    element: <NotFoundPage />,
  },
]);
