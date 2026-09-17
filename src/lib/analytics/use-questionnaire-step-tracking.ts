'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { AnalyticsFormChannel } from '@/lib/analytics/form-channel-event';
import { pushQuestionCompleteEvent, pushQuestionViewEvent } from '@/lib/analytics/gtm';

type UseQuestionnaireStepTrackingArgs = {
  /** Wait until draft hydrate finishes so the first view matches the restored step. */
  ready: boolean;
  questionId: string;
  /** 0-based index in the current wizard path. */
  questionIndex: number;
  questionTotal: number;
  formChannel: AnalyticsFormChannel;
};

type UseQuestionnaireStepTrackingResult = {
  /** Call after the current step validates and the user advances or submits. */
  trackQuestionComplete: () => void;
};

/**
 * Pushes GTM questionnaire funnel events: `question_view` on step display,
 * `question_complete` when the caller reports a successful advance.
 */
export function useQuestionnaireStepTracking({
  ready,
  questionId,
  questionIndex,
  questionTotal,
  formChannel,
}: UseQuestionnaireStepTrackingArgs): UseQuestionnaireStepTrackingResult {
  const latestRef = useRef({
    questionId,
    questionIndex,
    questionTotal,
    formChannel,
  });
  const lastViewKeyRef = useRef<string | null>(null);

  useEffect(() => {
    latestRef.current = {
      questionId,
      questionIndex,
      questionTotal,
      formChannel,
    };
  }, [questionId, questionIndex, questionTotal, formChannel]);

  useEffect(() => {
    if (!ready || questionTotal <= 0 || questionIndex < 0) {
      return;
    }

    const viewKey = `${formChannel}:${questionId}:${questionIndex}:${questionTotal}`;
    if (lastViewKeyRef.current === viewKey) {
      return;
    }
    lastViewKeyRef.current = viewKey;

    pushQuestionViewEvent({
      questionId,
      questionIndex: questionIndex + 1,
      questionTotal,
      formChannel,
    });
  }, [ready, questionId, questionIndex, questionTotal, formChannel]);

  const trackQuestionComplete = useCallback((): void => {
    const current = latestRef.current;
    if (current.questionTotal <= 0 || current.questionIndex < 0) {
      return;
    }

    pushQuestionCompleteEvent({
      questionId: current.questionId,
      questionIndex: current.questionIndex + 1,
      questionTotal: current.questionTotal,
      formChannel: current.formChannel,
    });
  }, []);

  return { trackQuestionComplete };
}
