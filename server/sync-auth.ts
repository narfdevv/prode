export function validateSyncSecret(request: Request) {
  const expectedSecret = process.env.API_SYNC_SECRET;
  if (!expectedSecret) {
    return false;
  }

  const headerSecret = request.headers.get("x-sync-secret");
  const authorization = request.headers.get("authorization");
  return headerSecret === expectedSecret || authorization === `Bearer ${expectedSecret}`;
}
