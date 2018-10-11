import { PolicyEvaluation } from "../models/policyEvaluation.model";
import { TokenService } from "./token.service";

export class PullRequestService {

    private policiesApiVersion = "5.0-preview.1";

    constructor(
        private webContext: WebContext,
        private gitHttpClient: any,
        private baseUri: string,
        private tokenService: TokenService
    ) {
    }

    getPullRequests() {
        return this.gitHttpClient.getPullRequestsByProject(this.webContext.project.name);
    }

    getPullRequestComments(pullRequest) {
        return this.gitHttpClient.getThreads(pullRequest.repository.id, pullRequest.pullRequestId);
    }

    getPullRequestPolicies(pullRequestId) {
        return this.tokenService.getToken()
            .then(
                token => {
                    let request = {
                        method: "GET",
                        headers: new Headers({
                            "Authorization": `bearer ${token.token}`
                        })
                    };

                    let artifactId = `vstfs:///CodeReview/CodeReviewId/${this.webContext.project.id}/${pullRequestId}`;
                    let query = `?artifactId=${artifactId}&api-version=${this.policiesApiVersion}`;
                    let url = `${this.baseUri}/_apis/policy/evaluations${query}`;

                    return fetch(url, request)
                        .then(response => response.json())
                        .then(json => json as PolicyEvaluation[]);
                }
            );
    }
}