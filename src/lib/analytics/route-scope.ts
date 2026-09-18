const SPYURK_LOCALE_PATH = /^\/(hy|en|ru)\/rf(?:\/|$)/;
const GENERAL_LOCALE_PATH = /^\/(hy|en|ru)(?:\/|$)/;

/** Spyurk RF form: `/rf` or `/{locale}/rf`. */
export function isSpyurkFormPath(pathname: string): boolean {
  if (pathname === '/rf' || pathname.startsWith('/rf/')) {
    return true;
  }

  return SPYURK_LOCALE_PATH.test(pathname);
}

/** Meta Pixel is for the general questionnaire only, never admin/ticket/Spyurk. */
export function shouldInitMetaPixel(pathname: string): boolean {
  if (pathname.startsWith('/admin') || pathname.startsWith('/ticket')) {
    return false;
  }

  return !isSpyurkFormPath(pathname);
}

/** Routes that Meta may frame while its Event Setup Tool is active. */
export function isMetaEventSetupPath(pathname: string): boolean {
  if (pathname === '/') {
    return true;
  }

  return GENERAL_LOCALE_PATH.test(pathname) && !isSpyurkFormPath(pathname);
}
