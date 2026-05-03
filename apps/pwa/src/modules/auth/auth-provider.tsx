"use client";

import { onAppChannelMessage, postAppChannelMessage } from "@/app.channel";
import { useApp } from "@/app.context";
import { endAppLoading } from "@/components/app-loading/app-loading";
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
import { wait } from "@/utils/common.utils";
import { onError, onErrorLog } from "@/utils/exceptions.utils";
import { useApolloClient, useMutation } from "@apollo/client/react";
import { removeTypeName } from "@joy-one-client/utils/remove-type-name";
import { useLingui } from "@lingui/react/macro";
import * as Sentry from "@sentry/react";
import { GithubAuthProvider, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getToken } from "firebase/messaging";
import { FC, PropsWithChildren, useCallback, useEffect, useState } from "react";
import { getGlobal } from "../../global";
import { DeviceFragment } from "../devices/graphql/fragmentDevice.graphql";
import SetDeviceLocaleDocument from "../devices/graphql/setDeviceLocale.graphql";
import SetDeviceNotificationTokenDocument from "../devices/graphql/setDeviceNotificationToken.graphql";
import { useUploadFile } from "../files/hooks/use-upload-file";
import GetTimeZonesDocument from "../times/graphql/getTimeZones.graphql";
import { Context } from "./auth-context";
import {
  serverCheckAuthStatus,
  serverSignInWithEmailPassword,
  serverSignInWithFacebook,
  serverSignInWithFirebase,
  serverSignOut,
  serverSignOutOtherDevices,
  serverSignUpWithEmailPassword,
} from "./auth-server";
import { onFacebookLogin } from "./auth-service";
import type { AuthContext } from "./auth-types";
import AuthUserDocument from "./graphql/authUser.graphql";
import { AuthUserFragment } from "./graphql/fragmentAuthUser.graphql";
import SetLocaleDocument from "./graphql/setLocale.graphql";
import SignOutDocument from "./graphql/signOut.graphql";
import UpdateUserProfileDocument from "./graphql/updateUserProfile.graphql";

let isFbInitialized = false;

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

  const [setDeviceNotificationToken] = useMutation(SetDeviceNotificationTokenDocument);
  const [setUserLocale] = useMutation(SetLocaleDocument);

  const uploadFile = useUploadFile();

  const initializeMetaPages = async () => {
    await new Promise((resolve, reject) => {
      const action = async (retry: number) => {
        try {
          const global = getGlobal();
          if (isFbInitialized) return resolve(true);

          const FB = global.FB;
          const isInitialized = !!isFbInitialized;
          if (isInitialized || !global.FB || !app.config) {
            await wait(1000);
            action(retry + 1);
          } else {
            FB.init({
              appId: app.config.metaAppId,
              version: app.config.metaAppVersion,
              xfbml: true,
            });
            resolve(true);
            isFbInitialized = true;
          }
        } catch (error) {
          if (retry > 5) return reject(error);
          await wait(1000);
          action(retry + 1);
        }
      };

      action(0);
    });
  };

  const initialize = async (type: "reconnect" | "init" | "auth") => {
    let authResult: AuthUserFragment | undefined = undefined;
    initializeMetaPages().catch((error) => console.warn(`Initialize meta pages failed`, error));

    try {
      const authStatusResult = await serverCheckAuthStatus();

      // Device
      const device = await prepareDevice();
      setDevice(device);

      if (authStatusResult?.result) {
        authResult = await client
          .query({
            query: AuthUserDocument,
          })
          .then((res) => res.data!.user);
        setUser(authResult);
      }

      if (type === "auth") {
        postAppChannelMessage("SIGN_IN");
      }
    } catch (error) {
      console.log(`Error when initializing auth > ${error}`);
    }

    setIsInitialized(true);
    endAppLoading("auth");
    return authResult;
  };

  const onReset = () => {
    setUser(undefined);
    setWorkspaceId(undefined);
    router.replace("/");
  };

  const [signOut] = useMutation(SignOutDocument);

  const handleSignOut = async () => {
    try {
      await Promise.all([signOut(), firebaseAuth.signOut()]);
      serverSignOut();
      client.cache.reset();
      onReset();
      postAppChannelMessage("SIGN_OUT");
    } catch (error) {
      onError(error);
    }
  };

  const handleSignInWithFirebase = async (idToken: string, username?: string) => {
    const { result: tokens, error } = await serverSignInWithFirebase(idToken, username);
    if (error || !tokens) throw Error(error ?? t`Failed to sign in with Firebase.`);
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
      const { result: tokens, error } = await serverSignInWithFacebook(authResponse.accessToken);
      if (error || !tokens) throw Error(error ?? t`Failed to sign in with Facebook.`);
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
    const { result, error } = await serverSignInWithEmailPassword(dto);
    if (error || !result) throw Error(error ?? t`Failed to sign in.`);
    await initialize("auth");
  };

  const signUpWithEmailPassword = async (input: AuthSignUpWithEmailPasswordInput) => {
    const { result, error } = await serverSignUpWithEmailPassword(input);
    if (error || !result) throw Error(error ?? t`Failed to sign up.`);
    await initialize("auth");
  };

  const [updateUserProfile] = useMutation(UpdateUserProfileDocument);
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
      }).then((res) => setUser(res.data?.user));
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

      const updatedDevice = await setDeviceNotificationToken({
        variables: {
          input: {
            notificationToken,
          },
        },
      });

      setDevice(updatedDevice.data?.device);
    } else {
      throw Error(t`Device does not support notifications.`);
    }
  };

  const detectTimeZone = async () => {
    try {
      if (!user) return;
      const timeZones = await client.query({
        query: GetTimeZonesDocument,
      });
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const currentUserTimeZone = timeZones.data?.timeZones.find((tz) => tz.utc.includes(timezone));
      await updateProfile({
        ...user,
        settings: { ...user.settings, timezoneId: currentUserTimeZone?.id },
      });
      return null;
    } catch (error) {
      console.error("Error when detecting timezone", error);
    }
  };

  const signOutOtherDevices = async () => {
    const { result: tokens, error } = await serverSignOutOtherDevices();
    if (error || !tokens) throw Error(error ?? t`Failed to sign out other devices.`);
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
      if (event.userId === user?._id) {
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

  const [setDeviceLocale] = useMutation(SetDeviceLocaleDocument);

  useEffect(() => {
    if (isInitialized && device && lang.locale !== device.locale) {
      setDeviceLocale({ variables: { input: { locale: lang.locale } } })
        .then((result) => setDevice(result.data?.device))
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
