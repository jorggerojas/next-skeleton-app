"use client";

import { useEffect, useState } from "react";
import {
  ConfigCatProvider,
  PollingMode,
  useConfigCatClient,
} from "configcat-react";
import { errorTracer } from "@/lib/observability/error";
import type { UserID } from "@/types/errors";

function getUserID(): UserID {
  if (typeof window === "undefined") return crypto.randomUUID();
  let id = window.localStorage.getItem("userID");
  if (!id) {
    id = crypto.randomUUID();
    window.localStorage.setItem("userID", id);
  }
  return id;
}

function FeatureFlagsManager({ children }: { children: React.ReactNode }) {
  const client = useConfigCatClient();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isReady) return;

    const userID = getUserID();

    errorTracer.setUser(userID);

    client.setDefaultUser({
      identifier: userID,
    });

    client.forceRefreshAsync().then(() => {
      setIsReady(true);
    });
  }, [client, isReady]);

  return <>{children}</>;
}

const DEMO_SDK_KEY = "PKDVCLf-Hq-h-kCzMp-L7Q/PsyV3ZN-Znz3LqKy7Bew";

export function FeatureFlagsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const sdkKey =
    process.env.NEXT_PUBLIC_CONFIG_CAT_SDK &&
    process.env.NEXT_PUBLIC_CONFIG_CAT_SDK !== "#"
      ? process.env.NEXT_PUBLIC_CONFIG_CAT_SDK
      : DEMO_SDK_KEY;

  return (
    <ConfigCatProvider sdkKey={sdkKey} pollingMode={PollingMode.ManualPoll}>
      <FeatureFlagsManager>{children}</FeatureFlagsManager>
    </ConfigCatProvider>
  );
}
