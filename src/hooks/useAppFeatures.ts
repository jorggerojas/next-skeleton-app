"use client";

import { useFeatureFlag } from "configcat-react";

const DEV_FEATURE_FLAGS = {
  "feature-a": true,
};

export function useAppFeatures() {
  const isDev = process.env.NODE_ENV === "development";

  const { value: ccFeatureA, loading: featureALoading } = useFeatureFlag(
    "feature-a",
    false,
  );

  return {
    isLoading: isDev ? false : featureALoading,
    featureA: isDev ? DEV_FEATURE_FLAGS["feature-a"] : ccFeatureA,
  };
}
