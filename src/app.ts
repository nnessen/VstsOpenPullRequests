import { DocumentService } from './services/document.service';
import { PullRequestService } from './services/pull-request.service';
import { TableService } from './services/table.service';

export class App {

    static noResultsId = "no-results";
    static refreshButtonId = "refresh-button";
    static swirlyBallsId = "swirly-balls";

    documentService: DocumentService;
    pullRequestService: PullRequestService;
    refreshButton: HTMLButtonElement;
    tableService: TableService;

    constructor(
        context: WebContext,
        gitHttpClient: any,
        baseUri: string
    ) {
        this.documentService = new DocumentService();
        this.pullRequestService = new PullRequestService(context, gitHttpClient);
        this.tableService = new TableService(this.documentService, baseUri);

        this.refreshButton = this.documentService.findElement(App.refreshButtonId);
        this.refreshButton.addEventListener("click", () => { this.reloadData(); });
    }

    loadData() {
        this.documentService.disableButton(this.refreshButton);
        this.documentService.findAndShowElement(App.swirlyBallsId);
        this.pullRequestService.getPullRequests()
            .then(
                pullRequests => {
                    this.documentService.enableButton(this.refreshButton);
                    this.documentService.findAndHideElement(App.swirlyBallsId);
                    this.tableService.addRows(pullRequests);

                    if (!pullRequests || !pullRequests.length) {
                        this.documentService.findAndShowElement(App.noResultsId);
                    }

                    return pullRequests;
                }
            )
            .then(
                pullRequests => {
                    let requests = [];

                    for (let i = 0; i < pullRequests.length; i++) {
                        let pullRequest = pullRequests[i];
                        requests.push(
                            this.pullRequestService.getPullRequestComments(pullRequest)
                                .then(
                                    threads => {
                                        this.tableService.updateComments(i, threads);
                                    }
                                )
                        );
                    }
                    return Promise.all(requests);
                }
            );
    }

    reloadData() {
        this.tableService.clear();
        this.documentService.findAndHideElement(App.noResultsId);
        this.loadData();
    }
}