import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  DEFAULT_GTM_CONTAINER_ID,
  parseGtmContainerId,
  pushQuestionCompleteEvent,
  pushQuestionViewEvent,
  pushRegistrationCompleteEvent,
  QUESTION_COMPLETE_EVENT,
  QUESTION_VIEW_EVENT,
  REGISTRATION_COMPLETE_EVENT,
  resolveGtmContainerId,
} from '@/lib/analytics/gtm';

describe('parseGtmContainerId', () => {
  it('accepts a standard container id', () => {
    expect(parseGtmContainerId('GTM-NJZV2NL3')).toBe('GTM-NJZV2NL3');
  });

  it('rejects empty and invalid values', () => {
    expect(parseGtmContainerId(undefined)).toBeNull();
    expect(parseGtmContainerId('')).toBeNull();
    expect(parseGtmContainerId('gtm-njzv2nl3')).toBeNull();
    expect(parseGtmContainerId('UA-123')).toBeNull();
  });
});

describe('resolveGtmContainerId', () => {
  it('falls back to the client container when env is unset', () => {
    expect(resolveGtmContainerId(undefined)).toBe(DEFAULT_GTM_CONTAINER_ID);
  });

  it('disables GTM when env is blank', () => {
    expect(resolveGtmContainerId('')).toBeNull();
  });
});

describe('pushRegistrationCompleteEvent', () => {
  const originalDataLayer = window.dataLayer;

  afterEach(() => {
    window.dataLayer = originalDataLayer;
    vi.unstubAllGlobals();
  });

  it('pushes the conversion event with the current path', () => {
    window.dataLayer = [];
    vi.stubGlobal('location', { pathname: '/hy/success' });

    pushRegistrationCompleteEvent();

    expect(window.dataLayer).toEqual([
      { event: REGISTRATION_COMPLETE_EVENT, page_path: '/hy/success' },
    ]);
  });

  it('includes form_channel when provided', () => {
    window.dataLayer = [];
    vi.stubGlobal('location', { pathname: '/ru/success' });

    pushRegistrationCompleteEvent('spyurk_rf');

    expect(window.dataLayer).toEqual([
      {
        event: REGISTRATION_COMPLETE_EVENT,
        page_path: '/ru/success',
        form_channel: 'spyurk_rf',
      },
    ]);
  });
});

describe('questionnaire step events', () => {
  const originalDataLayer = window.dataLayer;

  afterEach(() => {
    window.dataLayer = originalDataLayer;
    vi.unstubAllGlobals();
  });

  it('pushes question_view with named funnel parameters', () => {
    window.dataLayer = [];
    vi.stubGlobal('location', { pathname: '/hy' });

    pushQuestionViewEvent({
      questionId: 'identity',
      questionIndex: 1,
      questionTotal: 7,
      formChannel: 'general',
    });

    expect(window.dataLayer).toEqual([
      {
        event: QUESTION_VIEW_EVENT,
        question_id: 'identity',
        question_index: 1,
        question_total: 7,
        form_channel: 'general',
        page_path: '/hy',
      },
    ]);
  });

  it('pushes question_complete with named funnel parameters', () => {
    window.dataLayer = [];
    vi.stubGlobal('location', { pathname: '/ru/rf' });

    pushQuestionCompleteEvent({
      questionId: 'profile',
      questionIndex: 2,
      questionTotal: 8,
      formChannel: 'spyurk_rf',
    });

    expect(window.dataLayer).toEqual([
      {
        event: QUESTION_COMPLETE_EVENT,
        question_id: 'profile',
        question_index: 2,
        question_total: 8,
        form_channel: 'spyurk_rf',
        page_path: '/ru/rf',
      },
    ]);
  });

  it('appends multiple funnel events without clearing prior pushes', () => {
    window.dataLayer = [];
    vi.stubGlobal('location', { pathname: '/hy' });

    pushQuestionViewEvent({
      questionId: 'identity',
      questionIndex: 1,
      questionTotal: 3,
      formChannel: 'general',
    });
    pushQuestionCompleteEvent({
      questionId: 'identity',
      questionIndex: 1,
      questionTotal: 3,
      formChannel: 'general',
    });
    pushQuestionViewEvent({
      questionId: 'profile',
      questionIndex: 2,
      questionTotal: 3,
      formChannel: 'general',
    });

    expect(window.dataLayer?.map((entry) => entry.event)).toEqual([
      QUESTION_VIEW_EVENT,
      QUESTION_COMPLETE_EVENT,
      QUESTION_VIEW_EVENT,
    ]);
    expect(window.dataLayer).toHaveLength(3);
  });
});
