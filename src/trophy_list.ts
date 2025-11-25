import {
  AccountDurationTrophy,
  AllSuperRankCommunityTrophy,
  AllSuperRankIndividualTrophy,
  AncientAccountTrophy,
  Joined2020Trophy,
  LongTimeAccountTrophy,
  MegaSuperRankTrophy,
  MultipleLangTrophy,
  MultipleOrganizationsTrophy,
  OGAccountTrophy,
  TotalCommitTrophy,
  TotalExternalContributionsTrophy,
  TotalFollowerTrophy,
  TotalFollowingTrophy,
  TotalForkedReposTrophy,
  TotalIssueTrophy,
  TotalPullRequestTrophy,
  TotalRepositoryTrophy,
  TotalReviewsTrophy,
  TotalSponsoringTrophy,
  TotalStarTrophy,
  TotalStarsGivenTrophy,
  Trophy,
} from "./trophy.ts";
import { UserInfo } from "./user_info.ts";
import { RANK, RANK_ORDER } from "./utils.ts";

export class TrophyList {
  private trophies = new Array<Trophy>();
  private individualTrophies = new Array<Trophy>();
  private communityTrophies = new Array<Trophy>();
  constructor(userInfo: UserInfo) {
    // Base trophies (Individual Achievement Trophies)
    this.individualTrophies.push(
      new TotalStarTrophy(userInfo.totalStargazers),
      new TotalCommitTrophy(userInfo.totalCommits),
      new TotalFollowerTrophy(userInfo.totalFollowers),
      new TotalIssueTrophy(userInfo.totalIssues),
      new TotalPullRequestTrophy(userInfo.totalPullRequests),
      new TotalRepositoryTrophy(userInfo.totalRepositories),
      new TotalReviewsTrophy(userInfo.totalReviews),
      new AccountDurationTrophy(userInfo.durationDays),
    );
    // Contribution-focused trophies (Community Trophies)
    this.communityTrophies.push(
      new TotalStarsGivenTrophy(userInfo.totalStarsGiven),
      new TotalFollowingTrophy(userInfo.totalFollowing),
      new TotalForkedReposTrophy(userInfo.totalForkedRepos),
      new TotalExternalContributionsTrophy(userInfo.totalExternalContributions),
      new TotalSponsoringTrophy(userInfo.totalSponsoring),
    );
    
    // Combine all base trophies
    this.trophies.push(...this.individualTrophies, ...this.communityTrophies);
    
    // Secret trophies
    this.trophies.push(
      new AllSuperRankIndividualTrophy(this.isAllIndividualSRank),
      new AllSuperRankCommunityTrophy(this.isAllCommunitySRank),
      new MegaSuperRankTrophy(this.isMegaSuperRank),
      new MultipleLangTrophy(userInfo.languageCount),
      new LongTimeAccountTrophy(userInfo.durationYear),
      new AncientAccountTrophy(userInfo.ancientAccount),
      new OGAccountTrophy(userInfo.ogAccount),
      new Joined2020Trophy(userInfo.joined2020),
      new MultipleOrganizationsTrophy(userInfo.totalOrganizations),
    );
  }
  get length() {
    return this.trophies.length;
  }
  get getArray() {
    return this.trophies;
  }
  private get isAllIndividualSRank() {
    return this.individualTrophies.every((trophy) => trophy.rank.slice(0, 1) == RANK.S)
      ? 1
      : 0;
  }
  private get isAllCommunitySRank() {
    return this.communityTrophies.every((trophy) => trophy.rank.slice(0, 1) == RANK.S)
      ? 1
      : 0;
  }
  private get isMegaSuperRank() {
    return (this.isAllIndividualSRank === 1 && this.isAllCommunitySRank === 1)
      ? 1
      : 0;
  }
  filterByHidden() {
    this.trophies = this.trophies.filter((trophy) =>
      !trophy.hidden || trophy.rank !== RANK.UNKNOWN
    );
  }
  filterByTitles(titles: Array<string>) {
    this.trophies = this.trophies.filter((trophy) => {
      return trophy.filterTitles.some((title) => titles.includes(title));
    });
  }
  filterByRanks(ranks: Array<string>) {
    if (ranks.filter((rank) => rank.includes("-")).length !== 0) {
      this.trophies = this.trophies.filter((trophy) =>
        !ranks.map((rank) => rank.substring(1)).includes(trophy.rank)
      );
      return;
    }
    this.trophies = this.trophies.filter((trophy) =>
      ranks.includes(trophy.rank)
    );
  }
  filterByExclusionTitles(titles: Array<string>) {
    const excludeTitles = titles.filter((title) => title.startsWith("-")).map(
      (title) => title.substring(1),
    );
    if (excludeTitles.length > 0) {
      this.trophies = this.trophies.filter((trophy) =>
        !excludeTitles.includes(trophy.title)
      );
    }
  }
  sortByRank() {
    this.trophies = this.trophies.toSorted((a: Trophy, b: Trophy) =>
      RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank)
    );
  }
}
