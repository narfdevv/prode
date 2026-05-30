export type LeaderboardEntry = {
  id: string;
  rank: number;
  name: string;
  department: string;
  matches: string;
  points: number;
  isCurrentUser?: boolean;
};

export const leaderboardData: LeaderboardEntry[] = [
  {
    id: "u1",
    rank: 1,
    name: "Sasha Romanoff",
    department: "Engineering",
    matches: "48/48",
    points: 1240,
  },
  {
    id: "u2",
    rank: 2,
    name: "Marcus Wright",
    department: "Sales",
    matches: "48/48",
    points: 1185,
  },
  {
    id: "u3",
    rank: 3,
    name: "Elena Gilbert",
    department: "HR",
    matches: "46/48",
    points: 1150,
  },
  {
    id: "u42",
    rank: 42,
    name: "Felix (You)",
    department: "Product",
    matches: "44/48",
    points: 890,
    isCurrentUser: true,
  },
  {
    id: "u43",
    rank: 43,
    name: "Jonas Schmidt",
    department: "Engineering",
    matches: "42/48",
    points: 885,
  },
];
