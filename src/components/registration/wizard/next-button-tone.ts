/** Light until the current step validates, then the default dark primary. */
export function nextButtonToneClass(isStepComplete: boolean): string {
  return isStepComplete ? '' : 'bg-accent text-accent-foreground hover:bg-accent/90';
}
