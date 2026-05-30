export function getCurrentUserEmail() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("userEmail");
}
