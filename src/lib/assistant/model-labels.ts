/**
 * Model names shown to visitors next to each assistant task. Kept apart from
 * the request settings so the browser bundle carries only these captions;
 * update together with the model ids in ./models.
 */
export const modelLabels = {
  chat: "Claude Haiku 5.5",
  fit: "Claude Sonnet 5.5",
} as const;
