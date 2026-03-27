"use client";

import { onAppChannelMessage, postAppChannelMessage } from "@/app.channel";
import { useApp } from "@/app.context";
import { firebaseAuth, getFirebaseMessaging } from "@/configs/firebase.config";
import { StorageKey } from "@/constants/storage-key";
import { EventType } from "@/graphql/enums.graphql";
import {
  AuthSignInWithEmailPasswordInput,
  AuthSignUpWithEmailPasswordInput,
  UpdateUserProfileInput,
} from "@/graphql/types.graphql";
import { getLocalStorage, useLocalStorage } from "@/hooks/use-local-storage";
import { useRouter } from "@/hooks/use-router";
import { prepareDevice } from "@/modules/devices/devices-service";
import {
  onReconnected,
  useEventsListener,
  useUserEventsListner,
} from "@/modules/events/event-service";
import { useLang } from "@/modules/lang/lang-context";
import { getTimeZones } from "@/modules/times/times-service";
import { wait } from "@/utils/common.utils";
import { onError, onErrorLog } from "@/utils/exceptions.utils";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { removeTypeName } from "@joy-one-client/utils/remove-type-name";
import { useLingui } from "@lingui/react/macro";
import * as Sentry from "@sentry/react";
import axios from "axios";
import { GithubAuthProvider, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getToken } from "firebase/messaging";
import { FC, PropsWithChildren, useCallback, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { getGlobal } from "../../global";
import { DeviceFragment } from "../devices/graphql/fragmentDevice.graphql";
import MUTATION_SET_DEVICE_LOCALE from "../devices/graphql/mutationSetDeviceLocale.graphql";
import MUTATION_SET_DEVICE_NOTIFICATION_TOKEN from "../devices/graphql/mutationSetDeviceNotificationToken.graphql";
import { useUploadFile } from "../files/hooks/use-upload-file";
import { Context } from "./auth-context";
import {
  serverSignInWithEmailPassword,
  serverSignInWithFacebook,
  serverSignInWithFirebase,
  serverSignOutOtherDevices,
  serverSignUpWithEmailPassword,
} from "./auth-server";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  getSessionId,
  onFacebookLogin,
  saveClientTokens,
  setSessionId,
  setWorkspaceAuthSessionId,
} from "./auth-service";
import type { AuthContext } from "./auth-types";
import { AuthUserFragment } from "./graphql/fragmentAuthUser.graphql";
import MUTATION_SET_USER_LOCALE from "./graphql/mutationSetLocale.graphql";
import MUTATION_SIGN_OUT from "./graphql/mutationSignOut.graphql";
import MUTATION_UPDATE_USER_PROFILE from "./graphql/mutationUpdateUserProfile.graphql";
import QUERY_AUTH_USER from "./graphql/queryAuthUser.graphql";

const AuthProvider: FC<PropsWithChildren> = (props) => {
  const client = useApolloClient();
  const router = useRouter();
  const lang = useLang();
  const app = useApp();
  const { t } = useLingui();

  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<AuthUserFragment>();
  const [device, setDevice] = useState<DeviceFragment>();
  const [, setWorkspaceId] = useLocalStorage(StorageKey.WORKSPACE_ID);

  const [setDeviceNotificationToken] = useMutation(MUTATION_SET_DEVICE_NOTIFICATION_TOKEN);
  const [setUserLocale] = useMutation(MUTATION_SET_USER_LOCALE);

  const uploadFile = useUploadFile();

  const initializeMetaPages = async () => {
    await new Promise((resolve, reject) => {
      const action = async (retry: number) => {
        try {
          const global = getGlobal();
          if (global.FBInitialized) return resolve(true);

          const FB = global.FB;
          const isInitialized = !!global.FBInitialized;
          if (isInitialized || !global.FB || !global._appConfig) {
            await wait(1000);
            action(0);
          } else {
            FB.init({
              appId: global._appConfig.metaAppId,
              version: global._appConfig.metaAppVersion,
              xfbml: true,
            });
            resolve(true);
          }
        } catch (error) {
          if (retry > 3) return reject(error);
          await wait(1000);
          action(retry + 1);
        }
      };

      action(0);
    });
  };

  const initialize = async (type: "reconnect" | "init" | "auth") => {
    let authResult: AuthUserFragment | undefined = undefined;
    initializeMetaPages();
    setSessionId(uuid());

    const isAuthMigratedResult = await axios.get<{ isMigrated: boolean }>(`/api/auth-migrate`);

    if (type === "auth") {
      setWorkspaceAuthSessionId(uuid());
    }

    try {
      // Device
      const device = await prepareDevice();
      setDevice(device);

      // User information
      const accessToken = await getAccessToken();

      if (!isAuthMigratedResult.data.isMigrated && accessToken) {
        await axios.post(`/api/auth-migrate`, {
          accessToken: accessToken,
          refreshToken: await getRefreshToken(),
        });
      }

      if (accessToken) {
        authResult = await client
          .query({
            query: QUERY_AUTH_USER,
          })
          .then((res) => res.data!.authUser);
        setUser(authResult);
      }

      if (type === "auth") {
        postAppChannelMessage("SIGN_IN");
      }
    } catch (error) {
      console.log(`Error when initializing auth > ${error}`);
    }

    setIsInitialized(true);
    return authResult;
  };

  const onReset = () => {
    setUser(undefined);
    setWorkspaceId(undefined);
    router.replace("/");
  };

  const [signOut] = useMutation(MUTATION_SIGN_OUT);

  const handleSignOut = async () => {
    try {
      await Promise.all([signOut(), firebaseAuth.signOut()]);
      clearTokens();
      onReset();
      client.cache.reset();
      postAppChannelMessage("SIGN_OUT");
    } catch (error) {
      onError(error);
    }
  };

  const handleSignInWithFirebase = async (idToken: string, username?: string) => {
    const tokens = await serverSignInWithFirebase(idToken, username);
    await saveClientTokens(tokens);
    await initialize("auth");
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("email");

      const result = await signInWithPopup(firebaseAuth, provider);
      const idToken = await result.user.getIdToken();
      await handleSignInWithFirebase(idToken);
    } catch (error) {
      onError(error);
    }
  };

  const signInWithFacebook = async () => {
    try {
      const authResponse = await onFacebookLogin();
      const tokens = await serverSignInWithFacebook(authResponse.accessToken);
      await saveClientTokens(tokens);
      await initialize("auth");
      localStorage.setItem(StorageKey.META_ACCESS_TOKEN, authResponse.accessToken);
    } catch (error) {
      onError(error);
    }
  };

  const signInWithGithub = async () => {
    try {
      const provider = new GithubAuthProvider();
      provider.addScope("email");
      provider.setCustomParameters({ allow_signup: "false" });

      const result = await signInWithPopup(firebaseAuth, provider);
      const idToken = await result.user.getIdToken();
      await handleSignInWithFirebase(idToken, (result as any)._tokenResponse?.screenName);
    } catch (error) {
      onError(error);
    }
  };

  const signInWithEmailAndPassword = async (dto: AuthSignInWithEmailPasswordInput) => {
    const result = await serverSignInWithEmailPassword(dto);
    await saveClientTokens(result);
    await initialize("auth");
  };

  const signUpWithEmailPassword = async (input: AuthSignUpWithEmailPasswordInput) => {
    const result = await serverSignUpWithEmailPassword(input);
    await saveClientTokens(result);
    await initialize("auth");
  };

  const [updateUserProfile] = useMutation(MUTATION_UPDATE_USER_PROFILE);
  const updateProfile = useCallback(
    async (values: UpdateUserProfileInput) => {
      return updateUserProfile({
        variables: {
          input: {
            name: values.name,
            email: values.email,
            avatar: values.avatar,
            settings: values.settings ? removeTypeName(values.settings) : undefined,
          },
        },
      }).then((res) => setUser(res.data?.updateUserProfile));
    },
    [updateUserProfile],
  );

  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!user) return;
      const avatarFile = await uploadFile(file, { isPersonal: true, maxWidthOrHeight: 300 });
      return updateProfile({ ...user, avatar: avatarFile.url });
    },
    [uploadFile, updateProfile, user],
  );

  const registerNotification = async () => {
    if ("Notification" in window) {
      const isHasPermission = await Notification.requestPermission()
        .then((permission) => permission === "granted")
        .catch(() => false);

      if (!isHasPermission) throw Error(t`Notification permission not allowed.`);

      let notificationToken = "";

      const global = getGlobal();
      const isElectronApp = global.electron;

      if (isElectronApp) {
        await new Promise((resolve) => {
          global.electron?.getFCMToken("getFCMToken", (_: any, token: string) => {
            notificationToken = token;
            resolve(true);
          });
        });
      } else {
        const firebaseMessaging = getFirebaseMessaging();
        notificationToken = await getToken(firebaseMessaging)
          .catch(async () => {
            await wait(1000);
            return getToken(firebaseMessaging);
          })
          .catch((error) => {
            console.error(error);
            throw Error(t`Not receiving notification token. Please try again.`);
          });
      }

      const updatedDevice = await setDeviceNotificationToken({
        variables: {
          input: {
            notificationToken,
          },
        },
      });

      setDevice(updatedDevice.data?.setDeviceNotificationToken);
    } else {
      throw Error(t`Device does not support notifications.`);
    }
  };

  const detectTimeZone = async () => {
    try {
      if (!user) return;
      const timeZones = await getTimeZones();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const _timezone = timeZones.find((tz) => tz.utc.includes(timezone));
      await updateProfile({ ...user, settings: { ...user.settings, timezoneId: _timezone?.id } });
      return null;
    } catch (error) {
      console.error("Error when detecting timezone", error);
    }
  };

  const signOutOtherDevices = async () => {
    const tokens = await serverSignOutOtherDevices();
    await saveClientTokens(tokens);
  };

  const syncUserLocale = async () => {
    if (!user || !lang.isInitialized) return;
    if (user.locale !== lang.locale) {
      await setUserLocale({
        variables: {
          input: {
            locale: lang.locale ?? null,
          },
        },
      });
    }
  };

  useEffect(() => {
    if (isInitialized && user) {
      const search = new URLSearchParams(window.location.search);
      const authType = search.get("authType");
      if (authType) router.removeQuery("authType", true);

      if (!user.settings?.timezoneId) detectTimeZone();

      Sentry.setUser({ id: user._id, username: user.name, email: user.email });
    }
  }, [isInitialized, user]);

  useEffect(() => {
    if (user && lang.isInitialized && lang.locale) syncUserLocale();
  }, [user, lang.isInitialized, lang.locale]);

  useEventsListener(
    [EventType.UserProfileUpdated],
    (event) => {
      const sessionId = getSessionId();
      if (event.userId === user?._id && event.sessionId !== sessionId) {
        setUser(event.data);
      }
    },
    [user?._id],
  );

  useEffect(() => {
    if (app.isInitialized) {
      setIsInitialized(false);
      initialize("init");
    }
  }, [app.isInitialized]);

  onAppChannelMessage(
    "SIGN_IN",
    () => {
      if (app.isInitialized) initialize("init");
    },
    [app.isInitialized],
  );

  useEffect(() => {
    if (user?._id) app.joinSocket();
  }, [user?._id]);

  const [setDeviceLocale] = useMutation(MUTATION_SET_DEVICE_LOCALE);

  useEffect(() => {
    if (isInitialized && device && lang.locale !== device.locale) {
      setDeviceLocale({ variables: { input: { locale: lang.locale } } })
        .then((result) => setDevice(result.data?.setDeviceLocale))
        .catch(onErrorLog);
    }
  }, [isInitialized, lang]);

  onReconnected(() => initialize("reconnect"), []);
  onAppChannelMessage("SIGN_OUT", onReset);

  useUserEventsListner(async (event) => {
    const deviceId = getLocalStorage(StorageKey.DEVICE_ID);

    const isSignOut =
      event.eventName === "SIGN_OUT_DEVICES" &&
      Array.isArray(event.data?.deviceIds) &&
      event.data?.deviceIds.includes(deviceId);

    if (isSignOut) {
      await firebaseAuth.signOut();
      onReset();
    }
  });

  const ctx: AuthContext = {
    signInWithGoogle,
    device: device!,
    user: user!,
    isInitialized,
    signOut: handleSignOut,
    updateProfile,
    signInWithEmailAndPassword,
    signUpWithEmailPassword,
    signInWithFacebook,
    registerNotification,
    signInWithGithub,
    signOutOtherDevices,
    uploadAvatar,
  };

  return <Context.Provider value={ctx}>{props.children}</Context.Provider>;
};

export default AuthProvider;
