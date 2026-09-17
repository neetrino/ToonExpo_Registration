import type { AnalyticsFormChannel } from '@/lib/analytics/form-channel-event';

export const DEFAULT_GTM_CONTAINER_ID = 'GTM-NJZV2NL3';
export const REGISTRATION_COMPLETE_EVENT = 'registration_complete';
export const QUESTION_VIEW_EVENT = 'question_view';
export const QUESTION_COMPLETE_EVENT = 'question_complete';

const GTM_CONTAINER_ID_PATTERN = /^GTM-[A-Z0-9]+$/;

/** Named parameters for questionnaire funnel events in GA/GTM. */
export type QuestionnaireQuestionEventPayload = {
  questionId: string;
  /** 1-based step position in the current branch path. */
  questionIndex: number;
  questionTotal: number;
  formChannel: AnalyticsFormChannel;
};

/** Returns a valid GTM container id, or null when the value is empty/invalid. */
export function parseGtmContainerId(value: string | undefined): string | null {
  if (value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  return GTM_CONTAINER_ID_PATTERN.test(trimmed) ? trimmed : null;
}

/**
 * Resolves the GTM container id.
 * Unset env uses the client container. An empty or invalid value disables GTM.
 */
export function resolveGtmContainerId(
  envValue: string | undefined = process.env.NEXT_PUBLIC_GTM_ID,
): string | null {
  if (envValue === undefined) {
    return DEFAULT_GTM_CONTAINER_ID;
  }

  return parseGtmContainerId(envValue);
}

function ensureDataLayer(): Array<Record<string, unknown>> {
  window.dataLayer = window.dataLayer ?? [];
  return window.dataLayer;
}

export function pushRegistrationCompleteEvent(formChannel?: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  ensureDataLayer().push({
    event: REGISTRATION_COMPLETE_EVENT,
    page_path: window.location.pathname,
    ...(formChannel ? { form_channel: formChannel } : {}),
  });
}

function pushQuestionnaireQuestionEvent(
  event: typeof QUESTION_VIEW_EVENT | typeof QUESTION_COMPLETE_EVENT,
  payload: QuestionnaireQuestionEventPayload,
): void {
  if (typeof window === 'undefined') {
    return;
  }

  ensureDataLayer().push({
    event,
    question_id: payload.questionId,
    question_index: payload.questionIndex,
    question_total: payload.questionTotal,
    form_channel: payload.formChannel,
    page_path: window.location.pathname,
  });
}

/** Fires when a questionnaire step becomes visible. */
export function pushQuestionViewEvent(payload: QuestionnaireQuestionEventPayload): void {
  pushQuestionnaireQuestionEvent(QUESTION_VIEW_EVENT, payload);
}

/** Fires when a step validates and the user advances (or submits the last step). */
export function pushQuestionCompleteEvent(payload: QuestionnaireQuestionEventPayload): void {
  pushQuestionnaireQuestionEvent(QUESTION_COMPLETE_EVENT, payload);
}
