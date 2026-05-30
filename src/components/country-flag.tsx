import ReactCountryFlag from "react-country-flag";

type CountryFlagProps = {
  countryCode: string;
  label: string;
  className?: string;
};

export function CountryFlag({ countryCode, label, className }: CountryFlagProps) {
  return (
    <span className={`inline-flex h-[1em] w-[1em] overflow-hidden rounded-full ${className ?? ""}`}>
      <ReactCountryFlag
        countryCode={countryCode}
        svg
        aria-label={label}
        title={label}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          lineHeight: "1em",
        }}
      />
    </span>
  );
}
