import { createContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { Auth0Client } from '@auth0/auth0-spa-js';
import { auth0Config } from '../config';

let auth0Client = null;

var ActionType;
(function (ActionType) {
  ActionType['INITIALIZE'] = 'INITIALIZE';
  ActionType['LOGIN'] = 'LOGIN';
  ActionType['LOGOUT'] = 'LOGOUT';
})(ActionType || (ActionType = {}));

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null
};

const handlers = {
  INITIALIZE: (state, action) => {
    const { isAuthenticated, user } = action.payload;

    return {
      ...state,
      isAuthenticated,
      isInitialized: true,
      user
    };
  },
  LOGIN: (state, action) => {
    const { user } = action.payload;

    return {
      ...state,
      isAuthenticated: true,
      user
    };
  },
  LOGOUT: (state) => ({
    ...state,
    isAuthenticated: false,
    user: null
  })
};

const reducer = (state, action) => (handlers[action.type]
  ? handlers[action.type](state, action)
  : state);

export const AuthContext = createContext({
  ...initialState,
  platform: 'Auth0',
  loginWithRedirect: () => Promise.resolve(),
  handleRedirectCallback: () => Promise.resolve(undefined),
  logout: () => Promise.resolve()
});

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const initialize = async () => {
      try {
        auth0Client = new Auth0Client({
          redirect_uri: window.location.origin + '/authentication/authorize',
          domain: auth0Config.domain,
          client_id: auth0Config.client_id,
          cacheLocation: 'localstorage'
        });

        await auth0Client.checkSession();

        const isAuthenticated = await auth0Client.isAuthenticated();

        if (isAuthenticated) {
          const user = await auth0Client.getUser();

          // Here you should extract the complete user profile to make it
          // available in your entire app.
          // The auth state only provides basic information.

          dispatch({
            type: ActionType.INITIALIZE,
            payload: {
              isAuthenticated,
              user: {
                id: user.sub,
                avatar: user.picture,
                email: user.email,
                name: 'Anika Visser',
                plan: 'Premium'
              }
            }
          });
        } else {
          dispatch({
            type: ActionType.INITIALIZE,
            payload: {
              isAuthenticated,
              user: null
            }
          });
        }
      } catch (err) {
        console.error(err);
        dispatch({
          type: ActionType.INITIALIZE,
          payload: {
            isAuthenticated: false,
            user: null
          }
        });
      }
    };

    initialize();
  }, []);

  const loginWithRedirect = async (appState) => {
    await auth0Client.loginWithRedirect({
      appState
    });
  };

  const handleRedirectCallback = async () => {
    const result = await auth0Client.handleRedirectCallback();
    const user = await auth0Client.getUser();

    // Here you should extract the complete user profile to make it available in your entire app.
    // The auth state only provides basic information.

    dispatch({
      type: ActionType.LOGIN,
      payload: {
        user: {
          id: user.sub,
          avatar: user.picture,
          email: user.email,
          name: 'Anika Visser',
          plan: 'Premium'
        }
      }
    });

    return result.appState;
  };

  const logout = async () => {
    await auth0Client.logout();
    dispatch({
      type: ActionType.LOGOUT
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        platform: 'Auth0',
        loginWithRedirect,
        handleRedirectCallback,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export const AuthConsumer = AuthContext.Consumer;
