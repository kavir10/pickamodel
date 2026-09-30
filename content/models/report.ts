export const repoUrl = "https://github.com/kavir10/pickamodel";

/** A prefilled GitHub issue for reporting a wrong or stale number. */
export function reportHref(subject: string, context: string[] = []): string {
  const body = [
    `**What's wrong:** (the value you think is wrong, and what it should be)`,
    "",
    `**Source:** (a link to the vendor page, model card, or leaderboard that shows the right value)`,
    "",
    "---",
    ...context,
  ].join("\n");
  return `${repoUrl}/issues/new?${new URLSearchParams({ title: `Data correction: ${subject}`, body, labels: "data" }).toString()}`;
}
