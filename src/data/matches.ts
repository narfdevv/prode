export type Match = {
  id: string;
  group: string;
  homeTeam: string;
  homeFlag: string;
  awayTeam: string;
  awayFlag: string;
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
    homeFlag: "🇺🇸",
    awayTeam: "CAN",
    awayFlag: "🇨🇦",
    closesIn: "5h 20m",
    points: 150,
    prediction: { home: 2, away: 1 },
  },
  {
    id: "m2",
    group: "Group B",
    homeTeam: "MEX",
    homeFlag: "🇲🇽",
    awayTeam: "BRA",
    awayFlag: "🇧🇷",
    closesIn: "1d 12h",
    points: 220,
    prediction: { home: 0, away: 0 },
  },
  {
    id: "m3",
    group: "Group C",
    homeTeam: "ARG",
    homeFlag: "🇦🇷",
    awayTeam: "ESP",
    awayFlag: "🇪🇸",
    closesIn: "2d 04h",
    points: 180,
  },
  {
    id: "m4",
    group: "Group D",
    homeTeam: "ENG",
    homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    awayTeam: "JPN",
    awayFlag: "🇯🇵",
    closesIn: "3d 10h",
    points: 200,
  },
  {
    id: "m5",
    group: "Group A",
    homeTeam: "FRA",
    homeFlag: "🇫🇷",
    awayTeam: "GER",
    awayFlag: "🇩🇪",
    closesIn: "45m",
    points: 250,
    isUrgent: true,
  },
];
