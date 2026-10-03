import type { Job } from "./types";

export const dependencyUpgrade: Job = {
  slug: "dependency-upgrade",
  title: "upgrade a dependency without breaking the build",
  oneLiner: "A package jumped a major (or three minors piled up) and you need the diff that still compiles — not a changelog essay.",
  recommendations: [
    {
      model: "Sonnet-class",
      bestWhen: "The upgrade crosses a major, touches types/auth/build, or the breakage is spread across files.",
      avoidWhen: "It’s a patch bump with a green lockfile and no api change.",
      costVibe: "$$$",
    },
    {
      model: "Faster / cheaper cloud",
      bestWhen: "Mechanical bumps: rename an import, fix a type that moved, update a config key.",
      avoidWhen: "The failure is “tests pass, behavior changed” and you need to notice.",
      costVibe: "$",
    },
    {
      model: "Local mid",
      bestWhen: "Private repo, and the upgrade is mostly search-and-replace you can review.",
      avoidWhen: "You need it to read a long migration guide and apply only the parts that match this repo.",
      costVibe: "~free",
    },
  ],
  why: [
    "Upgrades fail quietly. The model that rewrites every call site is worse than the one that stops at the first real break.",
    "Cheap models are fine when the compiler tells them the answer. Frontier earns it when the compiler stays green and the app is wrong.",
    "Don’t let it bump the world. One dependency, one pr.",
    "Pair with test-generation if the old suite never covered the api you just changed.",
  ],
  relatedSlugs: ["test-generation", "refactor-pr", "codebase-onboarding"],
  lastUpdated: "2026-10-03",
};
