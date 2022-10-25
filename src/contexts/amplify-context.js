import { createContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import Auth from '@aws-amplify/auth';
import { amplifyConfig } from '../config';

Auth.configure({
  userPoolId: amplifyConfig.aws_user_pools_id,
  userPoolWebClientId: amplifyConfig.aws_user_pools_web_client_id,
  region: amplifyConfig.aws_cognito_region
});

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
  platform: 'Amplify',
  login: () => Promise.resolve(),
  logout: () => Promise.resolve(),
  register: () => Promise.resolve(),
  verifyCode: () => Promise.resolve(),
  resendCode: () => Promise.resolve(),
  passwordRecovery: () => Promise.resolve(),
  passwordReset: () => Promise.resolve()
});

export const AuthProvider = (props) => {
  const { children } = props;
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const initialize = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();

        // Here you should extract the complete user profile to make it
        // available in your entire app.
        // The auth state only provides basic information.

        dispatch({
          type: ActionType.INITIALIZE,
          payload: {
            isAuthenticated: true,
            user: {
              id: user.sub,
              avatar: '/static/mock-images/avatars/avatar-anika_visser.png',
              email: user.attributes.email,
              name: 'Anika Visser',
              plan: 'Premium'
            }
          }
        });
      } catch (error) {
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

  const login = async (email, password) => {
    const user = await Auth.signIn(email, password);

    if (user.challengeName) {
      console.error(`Unable to login, because challenge "${user.challengeName}" is mandated and we did not handle this case.`);
      return;
    }

    dispatch({
      type: ActionType.LOGIN,
      payload: {
        user: {
          id: user.attributes.sub,
          avatar: '/static/mock-images/avatars/avatar-anika_visser.png',
          email: user.attributes.email,
          name: 'Anika Visser',
          plan: 'Premium'
        }
      }
    });
  };

  const logout = async () => {
    await Auth.signOut();
    dispatch({
      type: ActionType.LOGOUT
    });
  };

  const register = async (email, password) => {
    await Auth.signUp({
      username: email,
      password,
      attributes: { email }
    });
  };

  const verifyCode = async (username, code) => {
    await Auth.confirmSignUp(username, code);
  };

  const resendCode = async (username) => {
    await Auth.resendSignUp(username);
  };

  const passwordRecovery = async (username) => {
    await Auth.forgotPassword(username);
  };

  const passwordReset = async (username, code, newPassword) => {
    await Auth.forgotPasswordSubmit(username, code, newPassword);
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        platform: 'Amplify',
        login,
        logout,
        register,
        verifyCode,
        resendCode,
        passwordRecovery,
        passwordReset
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
