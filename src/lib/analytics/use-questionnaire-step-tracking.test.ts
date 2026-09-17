import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useQuestionnaireStepTracking } from '@/lib/analytics/use-questionnaire-step-tracking';

describe('useQuestionnaireStepTracking', () => {
  const originalDataLayer = window.dataLayer;

  afterEach(() => {
    window.dataLayer = originalDataLayer;
    vi.unstubAllGlobals();
  });

  it('does not push question_view until ready', () => {
    window.dataLayer = [];
    vi.stubGlobal('location', { pathname: '/hy' });

    renderHook(() =>
      useQuestionnaireStepTracking({
        ready: false,
        questionId: 'identity',
        questionIndex: 0,
        questionTotal: 5,
        formChannel: 'general',
      }),
    );

    expect(window.dataLayer).toEqual([]);
  });

  it('pushes question_view once ready flips to true', () => {
    window.dataLayer = [];
    vi.stubGlobal('location', { pathname: '/hy' });

    const { rerender } = renderHook(
      ({ ready }) =>
        useQuestionnaireStepTracking({
          ready,
          questionId: 'identity',
          questionIndex: 0,
          questionTotal: 5,
          formChannel: 'general',
        }),
      { initialProps: { ready: false } },
    );

    expect(window.dataLayer).toEqual([]);

    rerender({ ready: true });

    expect(window.dataLayer).toEqual([
      {
        event: 'question_view',
        question_id: 'identity',
        question_index: 1,
        question_total: 5,
        form_channel: 'general',
        page_path: '/hy',
      },
    ]);
  });

  it('pushes question_view when a step becomes visible', () => {
    window.dataLayer = [];
    vi.stubGlobal('location', { pathname: '/hy' });

    renderHook(() =>
      useQuestionnaireStepTracking({
        ready: true,
        questionId: 'identity',
        questionIndex: 0,
        questionTotal: 5,
        formChannel: 'general',
      }),
    );

    expect(window.dataLayer).toEqual([
      {
        event: 'question_view',
        question_id: 'identity',
        question_index: 1,
        question_total: 5,
        form_channel: 'general',
        page_path: '/hy',
      },
    ]);
  });

  it('does not push question_view for an invalid step index', () => {
    window.dataLayer = [];
    vi.stubGlobal('location', { pathname: '/hy' });

    const { result } = renderHook(() =>
      useQuestionnaireStepTracking({
        ready: true,
        questionId: 'identity',
        questionIndex: -1,
        questionTotal: 5,
        formChannel: 'general',
      }),
    );

    act(() => {
      result.current.trackQuestionComplete();
    });

    expect(window.dataLayer).toEqual([]);
  });

  it('does not duplicate question_view on an identical rerender', () => {
    window.dataLayer = [];
    vi.stubGlobal('location', { pathname: '/hy' });

    const { rerender } = renderHook(
      ({ questionId, questionIndex }) =>
        useQuestionnaireStepTracking({
          ready: true,
          questionId,
          questionIndex,
          questionTotal: 5,
          formChannel: 'general',
        }),
      {
        initialProps: { questionId: 'identity', questionIndex: 0 },
      },
    );

    rerender({ questionId: 'identity', questionIndex: 0 });

    expect(window.dataLayer).toHaveLength(1);
    expect(window.dataLayer?.[0]).toMatchObject({
      event: 'question_view',
      question_id: 'identity',
    });
  });

  it('pushes another question_view when the step changes', () => {
    window.dataLayer = [];
    vi.stubGlobal('location', { pathname: '/ru/rf' });

    const { rerender } = renderHook(
      ({ questionId, questionIndex }) =>
        useQuestionnaireStepTracking({
          ready: true,
          questionId,
          questionIndex,
          questionTotal: 4,
          formChannel: 'spyurk_rf',
        }),
      {
        initialProps: { questionId: 'identity', questionIndex: 0 },
      },
    );

    rerender({ questionId: 'profile', questionIndex: 1 });

    expect(window.dataLayer).toEqual([
      {
        event: 'question_view',
        question_id: 'identity',
        question_index: 1,
        question_total: 4,
        form_channel: 'spyurk_rf',
        page_path: '/ru/rf',
      },
      {
        event: 'question_view',
        question_id: 'profile',
        question_index: 2,
        question_total: 4,
        form_channel: 'spyurk_rf',
        page_path: '/ru/rf',
      },
    ]);
  });

  it('pushes question_view again when returning to a previous step', () => {
    window.dataLayer = [];
    vi.stubGlobal('location', { pathname: '/en' });

    const { rerender } = renderHook(
      ({ questionId, questionIndex }) =>
        useQuestionnaireStepTracking({
          ready: true,
          questionId,
          questionIndex,
          questionTotal: 3,
          formChannel: 'general',
        }),
      {
        initialProps: { questionId: 'identity', questionIndex: 0 },
      },
    );

    rerender({ questionId: 'profile', questionIndex: 1 });
    rerender({ questionId: 'identity', questionIndex: 0 });

    expect(window.dataLayer?.map((entry) => entry.event)).toEqual([
      'question_view',
      'question_view',
      'question_view',
    ]);
    expect(window.dataLayer?.map((entry) => entry.question_id)).toEqual([
      'identity',
      'profile',
      'identity',
    ]);
  });

  it('pushes question_complete for the current step via trackQuestionComplete', () => {
    window.dataLayer = [];
    vi.stubGlobal('location', { pathname: '/en' });

    const { result } = renderHook(() =>
      useQuestionnaireStepTracking({
        ready: true,
        questionId: 'profile',
        questionIndex: 1,
        questionTotal: 6,
        formChannel: 'general',
      }),
    );

    act(() => {
      result.current.trackQuestionComplete();
    });

    expect(window.dataLayer).toEqual([
      {
        event: 'question_view',
        question_id: 'profile',
        question_index: 2,
        question_total: 6,
        form_channel: 'general',
        page_path: '/en',
      },
      {
        event: 'question_complete',
        question_id: 'profile',
        question_index: 2,
        question_total: 6,
        form_channel: 'general',
        page_path: '/en',
      },
    ]);
  });

  it('tracks complete for the latest step after navigation', () => {
    window.dataLayer = [];
    vi.stubGlobal('location', { pathname: '/hy' });

    const { result, rerender } = renderHook(
      ({ questionId, questionIndex }) =>
        useQuestionnaireStepTracking({
          ready: true,
          questionId,
          questionIndex,
          questionTotal: 4,
          formChannel: 'general',
        }),
      {
        initialProps: { questionId: 'identity', questionIndex: 0 },
      },
    );

    rerender({ questionId: 'profile', questionIndex: 1 });

    act(() => {
      result.current.trackQuestionComplete();
    });

    const completeEvents = (window.dataLayer ?? []).filter(
      (entry) => entry.event === 'question_complete',
    );
    expect(completeEvents).toEqual([
      {
        event: 'question_complete',
        question_id: 'profile',
        question_index: 2,
        question_total: 4,
        form_channel: 'general',
        page_path: '/hy',
      },
    ]);
  });

  it('emits a full view → complete → next-view funnel sequence', () => {
    window.dataLayer = [];
    vi.stubGlobal('location', { pathname: '/hy' });

    const { result, rerender } = renderHook(
      ({ questionId, questionIndex }) =>
        useQuestionnaireStepTracking({
          ready: true,
          questionId,
          questionIndex,
          questionTotal: 3,
          formChannel: 'general',
        }),
      {
        initialProps: { questionId: 'identity', questionIndex: 0 },
      },
    );

    act(() => {
      result.current.trackQuestionComplete();
    });
    rerender({ questionId: 'profile', questionIndex: 1 });
    act(() => {
      result.current.trackQuestionComplete();
    });
    rerender({ questionId: 'finish', questionIndex: 2 });

    expect(window.dataLayer?.map((entry) => entry.event)).toEqual([
      'question_view',
      'question_complete',
      'question_view',
      'question_complete',
      'question_view',
    ]);
    expect(window.dataLayer?.map((entry) => entry.question_id)).toEqual([
      'identity',
      'identity',
      'profile',
      'profile',
      'finish',
    ]);
    expect(window.dataLayer?.map((entry) => entry.question_index)).toEqual([1, 1, 2, 2, 3]);
  });
});
