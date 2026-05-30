import ReactCountryFlag from "react-country-flag";

type CountryFlagProps = {
  countryCode: string;
  label: string;
  className?: string;
};

export function CountryFlag({ countryCode, label, className }: CountryFlagProps) {
  const normalizedCode = countryCode.toLowerCase();
  const subdivisionFlags: Record<string, string> = {
    eng: "https://flagcdn.com/gb-eng.svg",
    sco: "https://flagcdn.com/gb-sct.svg",
  };
  const subdivisionFlag = subdivisionFlags[normalizedCode];

  return (
    <span className={`inline-flex h-[1em] w-[1em] overflow-hidden rounded-full ${className ?? ""}`}>
      {subdivisionFlag ? (
        <img
          src={subdivisionFlag}
          alt={label}
          title={label}
          className="h-full w-full object-cover"
        />
      ) : (
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
      )}
    </span>
  );
}
