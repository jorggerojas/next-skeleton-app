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

let userAttributionSet = false;

function FeatureFlagsManager({ children }: { children: React.ReactNode }) {
  const client = useConfigCatClient();
  const [isReady, setIsReady] = useState(false);

  if (typeof window !== "undefined" && !userAttributionSet) {
    userAttributionSet = true;
    errorTracer.setUser(getUserID());
  }

  useEffect(() => {
    if (isReady) return;

    const userID = getUserID();
    client.setDefaultUser({
      identifier: userID,
    });

    client.forceRefreshAsync().finally(() => setIsReady(true));
  }, [client, isReady]);

  return <>{children}</>;
}

export function FeatureFlagsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ConfigCatProvider
      sdkKey={process.env.NEXT_PUBLIC_CONFIG_CAT_SDK as string}
      pollingMode={PollingMode.ManualPoll}
    >
      <FeatureFlagsManager>{children}</FeatureFlagsManager>
    </ConfigCatProvider>
  );
}
