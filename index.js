#!/usr/bin/env node

import { program } from "commander";
import chalk from "chalk";

program
  .name("github-activity")
  .description("CLI to fetch GitHub user activity")
  .version("1.0.0");

function formatGitHubEvent(event) {
  switch (event.type) {
    case "PushEvent":
      return `- Pushed ${event.payload.commits.length} commit${
        event.payload.commits.length !== 1 ? "s" : ""
      } to ${event.repo.name}`;

    case "CreateEvent":
      return `- Created ${event.payload.ref_type} in ${event.repo.name}`;

    case "IssuesEvent":
      return `- ${
        event.payload.action.charAt(0).toUpperCase() +
        event.payload.action.slice(1)
      } an issue in ${event.repo.name}`;

    case "PullRequestEvent":
      return `- ${
        event.payload.action.charAt(0).toUpperCase() +
        event.payload.action.slice(1)
      } a pull request in ${event.repo.name}`;

    case "WatchEvent":
      return `- Starred ${event.repo.name}`;

    case "ForkEvent":
      return `- Forked ${event.repo.name}`;

    case "DeleteEvent":
      return `- Deleted ${event.payload.ref_type} ${event.payload.ref} from ${event.repo.name}`;

    case "CommentEvent":
      return `- Commented on ${event.repo.name}`;

    default:
      return `- ${event.type} in ${event.repo.name}`;
  }
}
program
  .argument("<username>", "Fetch recent activity of a github user")
  .action((username) => {
    const gitApiUrl = `https://api.github.com/users/${username}/events`;

    fetch(gitApiUrl, {
      headers: {
        "User-Agent": "GitHubActivityCLI",
        // Optional: Add Accept header for API versioning
        Accept: "application/vnd.github.v3+json",
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        // Limit to first 10 events to keep output concise
        const events = data.slice(0, 10);

        if (events.length === 0) {
          console.log("No recent activity found.");
          return;
        }

        console.log(`Recent GitHub Activities for ${username}:`);
        events.forEach((event) => {
          console.log(formatGitHubEvent(event));
        });
      })
      .catch((error) => {
        console.error("Error fetching GitHub activity:", error.message);
      });
  });

program.parse(process.argv);
