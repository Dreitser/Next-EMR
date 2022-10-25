import { GuestGuard } from '../components/authentication/guest-guard';

/**
 * @deprecated Use the layout strategy
 * @param Component
 */
export const withGuestGuard = (Component) => (props) => (
  <GuestGuard>
    <Component {...props} />
  </GuestGuard>
);
