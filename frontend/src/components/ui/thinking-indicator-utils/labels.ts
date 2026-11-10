import type { ThinkingIndicatorLabels } from "../thinking-indicator";

export function resolveLabels(
  defaultLabels: Readonly<Required<ThinkingIndicatorLabels>>,
  customLabels?: Partial<ThinkingIndicatorLabels>,
): Required<ThinkingIndicatorLabels> {
  return {
    ...defaultLabels,
    ...customLabels,
  };
}

