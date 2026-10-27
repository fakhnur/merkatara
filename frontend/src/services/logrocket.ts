import LogRocket from 'logrocket';
import { User } from '../types';

const appId = import.meta.env.VITE_LOGROCKET_APP_ID;

export const initLogRocket = (): void => {
  if (appId) {
    LogRocket.init(appId);
  }
};

export const identifyUser = (user: User): void => {
  if (appId) {
    LogRocket.identify(user.id, {
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }
};
