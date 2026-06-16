import { BRAND } from "@/lib/brand";

export default function BrandLogo() {
  return (
    <>
      {BRAND.namePart1}
      <span className="text-wheat">{BRAND.namePart2}</span>
    </>
  );
}
