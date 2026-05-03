"use client";

import OverlayLoading from "@/components/overlay-loading";
import { useAuth } from "@/modules/auth/auth-context";
import { UserAuthorization } from "@/modules/auth/components/user-authorization";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  if (!auth.isInitialized) return <OverlayLoading />;
  if (!auth.user) return <UserAuthorization />;

  return <>{children}</>;
}
