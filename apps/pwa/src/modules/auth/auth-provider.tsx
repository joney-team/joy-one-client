"use client";

import { useApp } from "@/app.context";
import { Fullscreen } from "@/components/fullscreen";
import { firebaseAuth, getFirebaseMessaging } from "@/configs/firebase.config";
import { defaultMetadata, setMetadata } from "@/configs/metadata.config";
import { useRouter } from "@/hooks/use-router";
import { initializeDevice, setDeviceLocale, setDeviceNotificationToken } from "@/modules/devices/devices-service";
import { type DeviceEntity } from "@/modules/devices/devices-types";
import {
  addEventsListener,
  onReconnected,
  removeEventsListner,
  useEventsListener,
  useUserEventsListner,
} from "@/modules/events/event-service";
import { EventEntity, EventType } from "@/modules/events/event-types";
import { useLang } from "@/modules/lang/lang-context";
import { getLocaleClient, t } from "@/modules/lang/lang-service";
import { LangState } from "@/modules/lang/lang-types";
import { showInAppNotification } from "@/modules/notifications/notification-service";
import { NotificationEntity } from "@/modules/notifications/notification-types";
import { MainRequest } from "@/modules/requests/main.request";
import { getTimeZones } from "@/modules/times/times-service";
import { setUserLocale, signOut } from "@/modules/users/users-service";
import { UpdateUserProfileDto, UserEntity } from "@/modules/users/users-types";
import { removeWorkspaceId } from "@/modules/workspaces/workspaces-service";
import { isExtendedApp } from "@/service";
import { StorageKey } from "@/types";
import { wait } from "@/utils/common.utils";
import { onError, onErrorLog } from "@/utils/exceptions.utils";
import { isDiff, objSelect } from "@/utils/object.utils";
import { useMantineTheme } from "@mantine/core";
import { GithubAuthProvider, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getToken, onMessage } from "firebase/messaging";
import { FC, PropsWithChildren, useEffect, useState } from "react";
import { v4 as uuid } from "uuid";
import { getGlobal } from "../../global";
import { Context } from "./auth-context";
import { AuthRequire } from "./auth-require";
import {
  clearTokens,
  getAccessToken,
  getSessionId,
  onFacebookLogin,
  saveTokens,
  setSessionId,
  setWorkspaceAuthSessionId,
} from "./auth-service";
import type {
  AuthContext,
  AuthSignInWithEmailPasswordDto,
  AuthSignUpWithEmailPasswordDto,
  AuthTokenResult,
  UserAuthResult,
} from "./auth-types";

const AuthProvider: FC<PropsWithChildren> = (props) => {
  const router = useRouter();
  const theme = useMantineTheme();
  const lang = useLang();
  const app = useApp();

  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<UserAuthResult>();
  const [device, setDevice] = useState<DeviceEntity>();

  const syncLocaleDeviceToUser = async (_user: UserEntity) => {
    try {
      const currentLocale = getLocaleClient();
      if (_user.locale !== currentLocale) {
        await setUserLocale(_user.locale);
      }
    } catch (error) {
      console.log(`Error when sync locale device to user`, error);
    }
  };

  const _initializeMeta = async () => {
    await new Promise((resolve) => {
      const action = async () => {
        const global = getGlobal();
        const FB = global.FB;
        const isInitialized = !!global.FBInitialized;
        if (isInitialized || !global.FB) {
          await wait(1000);
          action();
        } else {
          FB.init({ appId: app.config?.metaAppId, version: app.config?.metaAppVersion, xfbml: true });
          resolve(true);
        }
      };

      action();
    });
  };

  const initialize = async (type: "reconnect" | "init" | "auth") => {
    let _user: UserEntity | undefined = undefined;
    _initializeMeta();
    setSessionId(uuid());

    if (type === "auth") {
      setWorkspaceAuthSessionId(uuid());
    }

    try {
      // Device
      const device = await initializeDevice();
      setDevice(device);

      // User information
      const accessToken = await getAccessToken();
      if (accessToken) {
        _user = await MainRequest.get(`/auth`);
        setUser(_user);
      }

      // Sync locale device to user
      if (_user && !_user.locale) {
        syncLocaleDeviceToUser(_user!);
      }
    } catch (error) {
      console.log(`Error when initializing auth > ${error}`);
    }

    setIsInitialized(true);
    return _user;
  };

  const onSignOut = () => {
    clearTokens();
    removeWorkspaceId();
    setUser(undefined);
    router.replace("/");
  };

  const _signOut = async () => {
    await Promise.all([signOut(), firebaseAuth.signOut()]);

    onSignOut();

    if (isExtendedApp()) return;
    setMetadata(defaultMetadata);
  };

  const _signInWithFirebase = async (idToken: string, username?: string) => {
    const tokens = await MainRequest.post<AuthTokenResult>(`/auth/sign-in/firebase`, { idToken, username });
    await saveTokens(tokens);
    await initialize("auth");
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope("email");

      const result = await signInWithPopup(firebaseAuth, provider);
      const idToken = await result.user.getIdToken();
      await _signInWithFirebase(idToken);
    } catch (error) {
      onError(error);
    }
  };

  const signInWithFacebook = async () => {
    try {
      const authResponse = await onFacebookLogin();
      const tokens = await MainRequest.post<AuthTokenResult>(`/auth/sign-in/facebook`, {
        accessToken: authResponse.accessToken,
      });
      await saveTokens(tokens);
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
      await _signInWithFirebase(idToken, (result as any)._tokenResponse?.screenName);
    } catch (error) {
      onError(error);
    }
  };

  const signInWithEmailAndPassword = async (dto: AuthSignInWithEmailPasswordDto) => {
    const tokens = await MainRequest.post<AuthTokenResult>("/auth/sign-in/email-password", dto);
    await saveTokens(tokens);
    await initialize("auth");
  };

  const registerWithEmailAndPassword = async (dto: AuthSignUpWithEmailPasswordDto) => {
    const tokens = await MainRequest.post<AuthTokenResult>("/auth/sign-up/email-password", dto);
    await saveTokens(tokens);
    await initialize("auth");
  };

  const updateProfile = async (values: UpdateUserProfileDto) => {
    return MainRequest.put(`/users/profile`, values).then((res) => setUser(res));
  };

  const registerNotification = async () => {
    if ("Notification" in window) {
      const isHasPermission = await Notification.requestPermission()
        .then((permission) => permission === "granted")
        .catch(() => false);

      if (!isHasPermission) throw Error(t("notification_permission_not_allowed"));

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
            throw Error(t("notification_token_not_received"));
          });
      }

      const _device = await setDeviceNotificationToken({ notificationToken });
      setDevice(_device);
    } else {
      throw Error(t("device_does_not_support_notifications"));
    }
  };

  const listenNotification = async () => {
    const firebaseMessaging = getFirebaseMessaging();

    onMessage(firebaseMessaging, (payload) => {
      try {
        const notification = JSON.parse(payload.data?.raw!) as NotificationEntity;
        showInAppNotification(notification, router, theme);
      } catch (error) {
        console.log("Error when handling notification >", error);
      }
    });
  };

  const detectTimeZone = async () => {
    try {
      if (!user) return;
      const timeZones = await getTimeZones();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const _timezone = timeZones.find((tz) => tz.utc.includes(timezone));
      await updateProfile({ ...user, settings: { ...user.settings, timezone: _timezone?.id } });
      return null;
    } catch (error) {
      console.error("Error when detecting timezone", error);
    }
  };

  const syncUserSettingToLangState = () => {
    if (!user) return;
    if (user.settings.locale && user.settings.locale !== lang.locale) {
      lang.setLocale(user.settings.locale, false);
    }

    const keys: (keyof LangState)[] = ["isStartOfWeekSunday", "timezone", "isTwelveHour", "dateFormat"];

    const diff = isDiff(objSelect(user.settings, keys), objSelect(lang.state, keys));
    if (diff) lang.setState(objSelect(user.settings, keys));
  };

  useEffect(() => {
    if (isInitialized && user) {
      const search = new URLSearchParams(window.location.search);
      const authType = search.get("authType");
      if (authType) router.removeQuery("authType", true);

      if (!user.settings.timezone) detectTimeZone();
    }
  }, [isInitialized, user]);

  useEffect(() => {
    if (user?.settings) syncUserSettingToLangState();
  }, [user?.settings]);

  useEventsListener(
    [EventType.USER_PROFILE_UPDATED],
    (event) => {
      const sessionId = getSessionId();
      if (event.userId === user?._id && event.sessionId !== sessionId) {
        setUser(event.data);
      }
    },
    [user?._id]
  );

  useUserEventsListner(
    (e) => {
      if (device && e.eventName === "SIGN_OUT" && e.data?.deviceId === device?._id) {
        onSignOut();
      }
    },
    [device, onSignOut]
  );

  useEffect(() => {
    if (app.isInitialized) initialize("init");
  }, [app.isInitialized]);

  useEffect(() => {
    if (!!device?.notificationToken && "Notification" in window) {
      listenNotification();
    } else {
      const onNewNotification = (ev: EventEntity) => {
        showInAppNotification(ev.data, router, theme);
      };

      addEventsListener(EventType.NOTIFICATION_NEW, onNewNotification);

      return () => {
        removeEventsListner(EventType.NOTIFICATION_NEW, onNewNotification);
      };
    }
  }, [device?.notificationToken, device?.locale, lang.locale]);

  useEffect(() => {
    if (device) app.joinSocket();
  }, [device]);

  useEffect(() => {
    if (isInitialized && device && lang.locale !== device.locale) {
      setDeviceLocale({ locale: lang.locale }).catch(onErrorLog);
    }
  }, [isInitialized, lang]);

  onReconnected(() => initialize("reconnect"), []);

  const ctx: AuthContext = {
    signInWithGoogle,
    device: device!,
    user: user!,
    isInitialized,
    signOut: _signOut,
    updateProfile,
    signInWithEmailAndPassword,
    registerWithEmailAndPassword,
    signInWithFacebook,
    registerNotification,
    signInWithGithub,
  };

  return (
    <Context.Provider value={ctx}>
      {isInitialized && !user && (
        <Fullscreen>
          <AuthRequire />
        </Fullscreen>
      )}

      {props.children}
    </Context.Provider>
  );
};

export default AuthProvider;
