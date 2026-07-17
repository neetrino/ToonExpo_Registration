import type { Locale } from '@/types/locale';

export type ConfirmationMessageInput = {
  firstName: string;
  siteUrl: string;
};

export type ConfirmationMessage = {
  subject: string;
  text: string;
  html: string;
};

type MessageBuilder = (input: ConfirmationMessageInput) => ConfirmationMessage;

const messageBuilders: Record<Locale, MessageBuilder> = {
  hy: buildHyMessage,
  en: buildEnMessage,
  ru: buildRuMessage,
};

/**
 * Build localized confirmation email subject and bodies for Resend.
 */
export function buildConfirmationMessage(
  locale: Locale,
  input: ConfirmationMessageInput,
): ConfirmationMessage {
  return messageBuilders[locale](input);
}

function buildEnMessage(input: ConfirmationMessageInput): ConfirmationMessage {
  const subject = 'Toon Expo — registration confirmed';
  const paragraphs = [
    `Hello, ${input.firstName}.`,
    'Your registration for Toon Expo is confirmed.',
    'Event details (TBA):\n• Date: to be announced\n• Venue: to be announced',
    `Updates will be posted on the event website:\n${input.siteUrl}`,
    '— Toon Expo',
  ];

  return {
    subject,
    text: paragraphs.join('\n\n'),
    html: paragraphsToHtml(paragraphs),
  };
}

function buildHyMessage(input: ConfirmationMessageInput): ConfirmationMessage {
  const subject = 'Toon Expo — գրանցումը հաստատված է';
  const paragraphs = [
    `Բարև, ${input.firstName}։`,
    'Ձեր Toon Expo-ի գրանցումը հաստատված է։',
    'Միջոցառման մանրամասներ (TBA).\n• Ամսաթիվ. կհայտարարվի ավելի ուշ\n• Վայր. կհայտարարվի ավելի ուշ',
    `Թարմացումները կհրապարակենք Միջոցառման կայքը.\n${input.siteUrl}`,
    '— Toon Expo',
  ];

  return {
    subject,
    text: paragraphs.join('\n\n'),
    html: paragraphsToHtml(paragraphs),
  };
}

function buildRuMessage(input: ConfirmationMessageInput): ConfirmationMessage {
  const subject = 'Toon Expo — регистрация подтверждена';
  const paragraphs = [
    `Здравствуйте, ${input.firstName}.`,
    'Ваша регистрация на Toon Expo подтверждена.',
    'Детали мероприятия (TBA):\n• Дата: будет объявлена позже\n• Место: будет объявлено позже',
    `Обновления будут на сайте мероприятия:\n${input.siteUrl}`,
    '— Toon Expo',
  ];

  return {
    subject,
    text: paragraphs.join('\n\n'),
    html: paragraphsToHtml(paragraphs),
  };
}

function paragraphsToHtml(paragraphs: string[]): string {
  const body = paragraphs
    .map((paragraph) => `<p>${escapeHtml(paragraph).replace(/\n/g, '<br>')}</p>`)
    .join('\n');

  return `<!DOCTYPE html>\n<html lang="und">\n<body>${body}\n</body>\n</html>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
