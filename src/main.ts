import { DocumentService } from './services/document.service';
import { PullRequestService } from './services/pull-request.service';
import { TableService } from './services/table.service';

VSS.init({
    explicitNotifyLoaded: true,
    usePlatformScripts: true,
    usePlatformStyles: true
});

VSS.ready(() => {
    VSS.require([
        "VSS/Service",
        "TFS/VersionControl/GitRestClient"
        ],
        (vssService, gitClient) => {

            let context = VSS.getWebContext();
            let gitHttpClient = vssService.getCollectionClient(gitClient.GitHttpClient);

            if (context && gitHttpClient) {
                VSS.notifyLoadSucceeded();
            }
            else {
                VSS.notifyLoadFailed("Web Context or Git Client did not load.");
                return;
            }

            let baseUri = `${context.host.uri + context.project.name}`;
            let documentService = new DocumentService();
            let pullRequestService = new PullRequestService(context, gitHttpClient);
            let tableService = new TableService(documentService, baseUri)

            pullRequestService.getPullRequests()
                .then(
                    pullRequests => {
                        documentService.findAndHideElement("swirly-balls");
                        tableService.addRows(pullRequests);

                        return pullRequests;
                    }
                )
                .then(
                    pullRequests => {
                        if (!pullRequests || !pullRequests.length) {
                            documentService.findAndShowElement("no-results");
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
                                pullRequestService.getPullRequestComments(pullRequest)
                                    .then(
                                        threads => {
                                            tableService.updateComments(i, threads);
                                        }
                                    )
                            );
                        }
                        return Promise.all(requests);
                    }
                );
        }
    );
});