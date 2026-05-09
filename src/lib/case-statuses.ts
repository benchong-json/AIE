export const caseStatuses = [
  "discovered",
  "researching",
  "preparing-materials",
  "awaiting-referral",
  "applied",
  "recruiter-screen",
  "interviewing",
  "take-home",
  "offer",
  "rejected",
  "withdrawn",
  "dormant",
  "archived",
];

export function caseStatusLabel(status: string) {
  return status
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
