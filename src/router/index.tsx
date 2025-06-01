import { createBrowserRouter } from 'react-router';

import App from '@/App';
import { LoginPage, MCPPage, NotFoundPage, SignupPage } from '@/pages';
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
    path: PATHS.MCP,
    element: <MCPPage />,
  },
  {
    path: PATHS.NOT_FOUND,
    element: <NotFoundPage />,
  },
]);
