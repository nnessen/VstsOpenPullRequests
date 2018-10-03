import { PolicyEvaluation } from "../models/policyEvaluation.model";
import { TokenService } from "./token.service";

export class PoliciesService {

    private apiVersion = "5.0-preview.1";

    constructor(
        private webContext: WebContext,
        private baseUri: string,
        private tokenService: TokenService
    ) {
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
                    let query = `?artifactId=${artifactId}&api-version=${this.apiVersion}`;
                    let url = `${this.baseUri}/_apis/policy/evaluations${query}`;

                    return fetch(url, request)
                        .then(response => response.json())
                        .then(json => json as PolicyEvaluation[]);
                }
            );
    }
}