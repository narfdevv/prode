const ARGENTINA_UTC_OFFSET_MS = -3 * 60 * 60 * 1000;
const PREDICTION_CLOSE_BEFORE_KICKOFF_MS = 60 * 60 * 1000;

export function getKickoffTime(value: string) {
  const parsedTime = new Date(value).getTime();

  if (Number.isNaN(parsedTime)) return Number.NaN;

  return parsedTime - ARGENTINA_UTC_OFFSET_MS;
}

export function getPredictionDeadline(value: string) {
  return getKickoffTime(value) - PREDICTION_CLOSE_BEFORE_KICKOFF_MS;
}
