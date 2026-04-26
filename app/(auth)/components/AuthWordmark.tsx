import Image from "next/image";
import Link from "next/link";

import { SITE_LOGO } from "@/lib/site/marketing-site";

export type AuthWordmarkProps = {
  href?: string;
  /**
   * Pixel size for Next/Image intrinsic dimensions (layout uses responsive classes
   * matching `SiteNav`: `h-11` / `md:h-[60px]`).
   */
  imageSize?: number;
  /** Classes for the logo `Image` element */
  imageClassName?: string;
  /** Classes for the outer `Link` or `div` */
  linkClassName?: string;
};

export function AuthWordmark({
  href = "/",
  imageSize = 192,
  imageClassName,
  linkClassName,
}: AuthWordmarkProps) {
  const logoImg = (
    <Image
      src={SITE_LOGO}
      alt=""
      width={imageSize}
      height={imageSize}
      className={`h-full w-full object-cover object-center [clip-path:inset(7%_round_10px)] ${imageClassName ?? ""}`}
      priority
    />
  );

  const content = (
    <>
      {/* Same visual size as `SiteNav` logo: h-11 · md:60px */}
      <span className="relative inline-flex h-11 w-11 shrink-0 overflow-hidden rounded-xl md:h-[60px] md:w-[60px]">
        {logoImg}
      </span>
      <span className="ml-0.5 flex min-w-0 items-baseline gap-0 max-[480px]:hidden">
        <span className="text-xl font-extrabold tracking-tight text-[var(--product-name-color)] md:text-2xl">
          Reech
        </span>
        <span className="text-xl font-extrabold tracking-tight text-[var(--primary-color)] brightness-[1.05] md:text-2xl">
          Out
        </span>
      </span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={`flex min-w-0 shrink-0 items-center gap-0 no-underline ${linkClassName ?? ""}`}
        aria-label="ReechOut Home"
      >
        {content}
      </Link>
    );
  }

  return <div className={linkClassName}>{content}</div>;
}
