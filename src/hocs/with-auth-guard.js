import { AuthGuard } from '../components/authentication/auth-guard';

/**
 * @deprecated Use the layout strategy
 * @param Component
 */
export const withAuthGuard = (Component) => (props) => (
  <AuthGuard>
    <Component {...props} />
  </AuthGuard>
);
