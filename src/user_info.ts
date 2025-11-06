type Language = { name: string };
type Stargazers = { totalCount: number };
type Repository = {
  languages: { nodes: Language[] };
  stargazers: Stargazers;
};
export type GitHubUserRepository = {
  repositories: {
    totalCount: number;
    nodes: Repository[];
  };
};

export type GitHubUserIssue = {
  openIssues: {
    totalCount: number;
  };
  closedIssues: {
    totalCount: number;
  };
};

export type GitHubUserPullRequest = {
  pullRequests: {
    totalCount: number;
  };
};

export type GitHubUserActivity = {
  login: string;
  createdAt: string;
  contributionsCollection: {
    totalCommitContributions: number;
    restrictedContributionsCount: number;
    totalPullRequestReviewContributions: number;
  };
  organizations: {
    totalCount: number;
  };
  followers: {
    totalCount: number;
  };
};

type CommitContribution = {
  repository: {
    isInOrganization: boolean;
    viewerPermission: string | null;
    owner: {
      login: string;
    };
  };
  contributions: {
    totalCount: number;
  };
};

export type GitHubUserContributions = {
  starredRepositories: {
    totalCount: number;
  };
  following: {
    totalCount: number;
  };
  repositories: {
    totalCount: number;
  };
  contributionsCollection: {
    commitContributionsByRepository: CommitContribution[];
  };
};
export class UserInfo {
  public readonly totalCommits: number;
  public readonly totalFollowers: number;
  public readonly totalIssues: number;
  public readonly totalOrganizations: number;
  public readonly totalPullRequests: number;
  public readonly totalReviews: number;
  public readonly totalStargazers: number;
  public readonly totalRepositories: number;
  public readonly languageCount: number;
  public readonly durationYear: number;
  public readonly durationDays: number;
  public readonly ancientAccount: number;
  public readonly joined2020: number;
  public readonly ogAccount: number;
  public readonly totalStarsGiven: number;
  public readonly totalFollowing: number;
  public readonly totalForkedRepos: number;
  public readonly totalExternalContributions: number;
  constructor(
    userActivity: GitHubUserActivity,
    userIssue: GitHubUserIssue,
    userPullRequest: GitHubUserPullRequest,
    userRepository: GitHubUserRepository,
    userContributions?: GitHubUserContributions,
  ) {
    const totalCommits =
      userActivity.contributionsCollection.restrictedContributionsCount +
      userActivity.contributionsCollection.totalCommitContributions;
    const totalStargazers = userRepository.repositories.nodes.reduce(
      (prev: number, node: Repository) => {
        return prev + node.stargazers.totalCount;
      },
      0,
    );

    const languages = new Set<string>();
    userRepository.repositories.nodes.forEach((node: Repository) => {
      if (node.languages.nodes != undefined) {
        node.languages.nodes.forEach((node: Language) => {
          if (node != undefined) {
            languages.add(node.name);
          }
        });
      }
    });
    const durationTime = new Date().getTime() -
      new Date(userActivity.createdAt).getTime();
    const durationYear = new Date(durationTime).getUTCFullYear() - 1970;
    const durationDays = Math.floor(
      durationTime / (1000 * 60 * 60 * 24) / 100,
    );
    const ancientAccount =
      new Date(userActivity.createdAt).getFullYear() <= 2010 ? 1 : 0;
    const joined2020 = new Date(userActivity.createdAt).getFullYear() == 2020
      ? 1
      : 0;
    const ogAccount = new Date(userActivity.createdAt).getFullYear() <= 2008
      ? 1
      : 0;

    this.totalCommits = totalCommits;
    this.totalFollowers = userActivity.followers.totalCount;
    this.totalIssues = userIssue.openIssues.totalCount +
      userIssue.closedIssues.totalCount;
    this.totalOrganizations = userActivity.organizations.totalCount;
    this.totalPullRequests = userPullRequest.pullRequests.totalCount;
    this.totalReviews =
      userActivity.contributionsCollection.totalPullRequestReviewContributions;
    this.totalStargazers = totalStargazers;
    this.totalRepositories = userRepository.repositories.totalCount;
    this.languageCount = languages.size;
    this.durationYear = durationYear;
    this.durationDays = durationDays;
    this.ancientAccount = ancientAccount;
    this.joined2020 = joined2020;
    this.ogAccount = ogAccount;

    // Contribution-focused metrics
    if (userContributions) {
      this.totalStarsGiven = userContributions.starredRepositories.totalCount;
      this.totalFollowing = userContributions.following.totalCount;
      this.totalForkedRepos = userContributions.repositories.totalCount;

      // Calculate external contributions (commits to repos where user is not owner/admin/maintainer)
      const username = userActivity.login;
      const externalCommits = userContributions.contributionsCollection
        .commitContributionsByRepository
        .filter((contrib) => {
          const repo = contrib.repository;
          // Consider it external if:
          // 1. User doesn't own it (owner.login !== username)
          // 2. User has no write permissions (viewerPermission is READ or null)
          const isNotOwner = repo.owner.login !== username;
          const hasNoWriteAccess = !repo.viewerPermission ||
            repo.viewerPermission === "READ";
          return isNotOwner && hasNoWriteAccess;
        })
        .reduce((total, contrib) => total + contrib.contributions.totalCount, 0);

      this.totalExternalContributions = externalCommits;
    } else {
      this.totalStarsGiven = 0;
      this.totalFollowing = 0;
      this.totalForkedRepos = 0;
      this.totalExternalContributions = 0;
    }
  }
}
