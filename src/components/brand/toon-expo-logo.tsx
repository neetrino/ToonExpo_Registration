import Image from 'next/image';

type ToonExpoLogoProps = {
  className?: string;
  size?: number;
  priority?: boolean;
};

/**
 * Official Toon Expo mark from brand assets (`public/brand/toon-expo-logo.svg`).
 */
export function ToonExpoLogo({ className, size = 40, priority = false }: ToonExpoLogoProps) {
  return (
    <Image
      src="/brand/toon-expo-logo.svg"
      alt=""
      width={size}
      height={Math.round(size * (66.2954 / 65))}
      className={className}
      priority={priority}
      unoptimized
    />
  );
}
