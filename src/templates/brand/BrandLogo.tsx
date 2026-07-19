import Image from "next/image";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
  sizes?: string;
};

export default function BrandLogo({ className = "", priority = false, sizes = "160px" }: BrandLogoProps) {
  return (
    <span className={`relative inline-block shrink-0 overflow-hidden bg-dark-blue ${className}`}>
      <Image
        src="/logo-lsz-store.png"
        alt="LSZ Store"
        fill
        unoptimized
        priority={priority}
        className="scale-[1.32] object-cover"
        sizes={sizes}
      />
    </span>
  );
}
