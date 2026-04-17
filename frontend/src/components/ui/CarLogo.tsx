interface Props {
  make: string;
  size?: number;
  className?: string;
}

// Normalize make name to match car-logos-dataset slugs
function slugify(make: string): string {
  return make
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    // Common aliases
    .replace(/^vaz$/, "lada")
    .replace(/^vw$/, "volkswagen")
    .replace(/^merc$/, "mercedes-benz")
    .replace(/^mercedes$/, "mercedes-benz")
    .replace(/^land-rover$/, "land-rover")
    .replace(/^rangerover$/, "land-rover")
    .replace(/^bmw$/, "bmw");
}

const CDN = "https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/thumb";

export function CarLogo({ make, size = 32, className = "" }: Props) {
  const slug = slugify(make);
  const src = `${CDN}/${slug}.png`;

  return (
    <img
      src={src}
      alt={make}
      width={size}
      height={size}
      className={`object-contain ${className}`}
      onError={(e) => {
        // Fallback: hide broken image, parent shows emoji
        (e.target as HTMLImageElement).style.display = "none";
      }}
    />
  );
}
