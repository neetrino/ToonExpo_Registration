import { createBrandIconImage } from '@/lib/brand/create-brand-icon';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default function Icon() {
  return createBrandIconImage(size.width);
}
