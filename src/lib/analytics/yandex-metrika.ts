import {
  REGISTRATION_COMPLETE_EVENT,
  type QuestionnaireQuestionEventPayload,
} from '@/lib/analytics/gtm';

export const DEFAULT_YANDEX_METRIKA_ID = '112495551';

const YANDEX_METRIKA_ID_PATTERN = /^\d{6,12}$/;

/** Returns a valid Yandex Metrika counter id, or null when empty/invalid. */
export function parseYandexMetrikaId(value: string | undefined): string | null {
  if (value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }

  return YANDEX_METRIKA_ID_PATTERN.test(trimmed) ? trimmed : null;
}

/**
 * Resolves the Yandex Metrika counter id.
 * Unset env uses the client counter. An empty or invalid value disables Metrika.
 */
export function resolveYandexMetrikaId(
  envValue: string | undefined = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID,
): string | null {
  if (envValue === undefined) {
    return DEFAULT_YANDEX_METRIKA_ID;
  }

  return parseYandexMetrikaId(envValue);
}

/** Official Metrika loader + init. `counterId` must already be validated. */
export function buildYandexMetrikaSnippet(counterId: string): string {
  const id = parseYandexMetrikaId(counterId);
  if (!id) {
    return '';
  }

  return `(function(m,e,t,r,i,k,a){
    m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
    m[i].l=1*new Date();
    for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
    k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
})(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=${id}', 'ym');
ym(${id}, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});`;
}

export const YANDEX_QUESTION_VIEW_GOAL_PREFIX = 'rf_q_view_';
export const YANDEX_QUESTION_DONE_GOAL_PREFIX = 'rf_q_done_';

type YandexMetrikaCall = (...args: unknown[]) => void;

function getYandexMetrikaCall(): YandexMetrikaCall | null {
  const id = resolveYandexMetrikaId();
  if (typeof window === 'undefined' || typeof window.ym !== 'function' || !id) {
    return null;
  }

  const ym = window.ym;
  return (...args: unknown[]) => ym(Number(id), ...args);
}

export function hitYandexMetrika(url: string): void {
  getYandexMetrikaCall()?.('hit', url);
}

export function trackYandexRegistrationComplete(): void {
  getYandexMetrikaCall()?.('reachGoal', REGISTRATION_COMPLETE_EVENT);
}

function reachYandexQuestionGoal(prefix: string, params: QuestionnaireQuestionEventPayload): void {
  getYandexMetrikaCall()?.('reachGoal', `${prefix}${params.questionId}`, {
    question_id: params.questionId,
    question_index: params.questionIndex,
    question_total: params.questionTotal,
    form_channel: params.formChannel,
  });
}

/** Sends `rf_q_view_<questionId>` when a questionnaire step is shown. */
export function trackYandexQuestionView(params: QuestionnaireQuestionEventPayload): void {
  reachYandexQuestionGoal(YANDEX_QUESTION_VIEW_GOAL_PREFIX, params);
}

/** Sends `rf_q_done_<questionId>` when a step validates and the client lets the user advance. */
export function trackYandexQuestionDone(params: QuestionnaireQuestionEventPayload): void {
  reachYandexQuestionGoal(YANDEX_QUESTION_DONE_GOAL_PREFIX, params);
}
