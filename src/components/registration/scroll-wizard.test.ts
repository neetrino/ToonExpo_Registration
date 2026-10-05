import { afterEach, describe, expect, it, vi } from 'vitest';
import { findFirstInvalidField, scrollToFirstInvalidField } from './scroll-wizard';

describe('findFirstInvalidField', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('returns the nested other input instead of an ancestor group', () => {
    document.body.innerHTML = `
      <div id="form">
        <div id="group" aria-invalid="true">
          <div data-wizard-field="marzCity-aragatsotn-other">
            <input id="other" aria-invalid="true" />
          </div>
        </div>
      </div>
    `;

    const form = document.getElementById('form');
    expect(form).toBeInstanceOf(HTMLElement);
    expect(findFirstInvalidField(form as HTMLElement)?.id).toBe('other');
  });

  it('keeps the first invalid control when later fields are siblings', () => {
    document.body.innerHTML = `
      <div id="form">
        <input id="first" aria-invalid="true" />
        <input id="second" aria-invalid="true" />
      </div>
    `;

    const form = document.getElementById('form');
    expect(findFirstInvalidField(form as HTMLElement)?.id).toBe('first');
  });
});

describe('scrollToFirstInvalidField', () => {
  afterEach(() => {
    document.body.replaceChildren();
    vi.restoreAllMocks();
  });

  it('scrolls the other-field block into view when it is off screen', () => {
    document.body.innerHTML = `
      <div id="form">
        <div id="field" data-wizard-field="residenceMarzCity-aragatsotn-other">
          <input id="other" aria-invalid="true" />
        </div>
      </div>
    `;

    const field = document.getElementById('field');
    const input = document.getElementById('other');
    expect(field).toBeInstanceOf(HTMLElement);
    expect(input).toBeInstanceOf(HTMLInputElement);

    vi.spyOn(field as HTMLElement, 'getBoundingClientRect').mockReturnValue({
      top: 900,
      bottom: 980,
      left: 0,
      right: 200,
      width: 200,
      height: 80,
      x: 0,
      y: 900,
      toJSON: () => ({}),
    });
    const scrollIntoView = vi.fn();
    (field as HTMLElement).scrollIntoView = scrollIntoView;
    const focus = vi.fn();
    (input as HTMLInputElement).focus = focus;

    scrollToFirstInvalidField(document.getElementById('form'));

    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' });
    expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  });
});
