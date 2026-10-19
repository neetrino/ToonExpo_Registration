import { z } from 'zod';

export function refineIncomeTaxRefund(
  data: { purchaseMethod: string; incomeTaxRefund?: boolean | '' },
  ctx: z.RefinementCtx,
  required = true,
): void {
  if (required && data.purchaseMethod === 'mortgage' && typeof data.incomeTaxRefund !== 'boolean') {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['incomeTaxRefund'], message: 'required' });
  }
  if (data.purchaseMethod !== 'mortgage' && typeof data.incomeTaxRefund === 'boolean') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['incomeTaxRefund'],
      message: 'Only allowed for mortgage',
    });
  }
}
