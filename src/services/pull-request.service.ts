export class PullRequestService {

    constructor(
        private webContext: WebContext,
        private gitHttpClient: any
    ) {
    }

    getPullRequests() {
        return this.gitHttpClient.getPullRequestsByProject(this.webContext.project.name);
    }

    getPullRequestComments(pullRequest) {
        return this.gitHttpClient.getThreads(pullRequest.repository.id, pullRequest.pullRequestId);
    }
}