export type Match = {
  id: string;
  group: string;
  homeTeam: string;
  homeCountryCode: string;
  awayTeam: string;
  awayCountryCode: string;
  closesIn: string;
  points: number;
  prediction?: { home: number; away: number };
  isUrgent?: boolean;
};

export const matches: Match[] = [
  {
    id: "m1",
    group: "Group A",
    homeTeam: "USA",
    homeCountryCode: "US",
    awayTeam: "CAN",
    awayCountryCode: "CA",
    closesIn: "5h 20m",
    points: 150,
    prediction: { home: 2, away: 1 },
  },
  {
    id: "m2",
    group: "Group B",
    homeTeam: "MEX",
    homeCountryCode: "MX",
    awayTeam: "BRA",
    awayCountryCode: "BR",
    closesIn: "1d 12h",
    points: 220,
    prediction: { home: 0, away: 0 },
  },
  {
    id: "m3",
    group: "Group C",
    homeTeam: "ARG",
    homeCountryCode: "AR",
    awayTeam: "ESP",
    awayCountryCode: "ES",
    closesIn: "2d 04h",
    points: 180,
  },
  {
    id: "m4",
    group: "Group D",
    homeTeam: "ENG",
    homeCountryCode: "GB",
    awayTeam: "JPN",
    awayCountryCode: "JP",
    closesIn: "3d 10h",
    points: 200,
  },
  {
    id: "m5",
    group: "Group A",
    homeTeam: "FRA",
    homeCountryCode: "FR",
    awayTeam: "GER",
    awayCountryCode: "DE",
    closesIn: "45m",
    points: 250,
    isUrgent: true,
  },
];
