VSS.init({
    explicitNotifyLoaded: true,
    usePlatformScripts: true,
    usePlatformStyles: true
});

var createAnchorCell = function (row, index, text, href) {
    let cell = row.insertCell(index);
    let anchor = document.createElement("a");
    anchor.href = href;
    anchor.target = "_parent";
    anchor.text = text;
    cell.appendChild(anchor);
};

var createBranchCell = function (row, index, pullRequest, baseUri) {
    let cell = row.insertCell(index);
    let sourceBranch = pullRequest.sourceRefName.replace("refs/heads/", "");
    let targetBranch = pullRequest.targetRefName.replace("refs/heads/", "");

    let container = document.createElement("span");
    let source = document.createElement("span");
    let into = document.createElement("span");
    let target = document.createElement("span");

    source.className = "bowtie-icon bowtie-tfvc-branch";
    let sourceLink = document.createElement("a");
    sourceLink.href = `${baseUri}/_git/${pullRequest.repository.name}#version=GB${sourceBranch}`;
    sourceLink.target = "_parent";
    sourceLink.text = sourceBranch;
    source.appendChild(sourceLink);

    into.className = "bowtie-icon bowtie-arrow-right pull-into";

    target.className = "bowtie-icon bowtie-tfvc-branch";
    let targetLink = document.createElement("a");
    targetLink.href = `${baseUri}/_git/${pullRequest.repository.name}#version=GB${targetBranch}`;
    targetLink.target = "_parent";
    targetLink.text = targetBranch;
    target.appendChild(targetLink);

    container.appendChild(source);
    container.appendChild(into);
    container.appendChild(target);
    cell.appendChild(container);
};

var createCommentsCell = function (row, index, rowIndex, pullRequest) {
    let cell = row.insertCell(index);
    cell.id = `${rowIndex}|commentCell`;
    cell.className = "comments";

    let icon = document.createElement("span");
    icon.id = `${rowIndex}|commentIcon`;
    icon.title = "Comments";
    icon.className = "bowtie-icon bowtie-comment-discussion comment-icon no-display";

    let text = document.createElement("span");
    text.id = `${rowIndex}|commentCount`;
    text.textContent = "Loading...";
    text.className = "comment-count";

    cell.appendChild(icon);
    cell.appendChild(text);
};

var createImgCell = function (row, index, src, tooltip) {
    let cell = row.insertCell(index);
    let img = this.createImgElement(src, tooltip);
    cell.appendChild(img);
};

var createImgElement = function (src, tooltip) {
    let img = document.createElement("img");
    img.src = src;
    img.className = "row-image";
    img.alt = tooltip;
    img.title = tooltip;
    return img;
};

var createMergeStatusCell = function (row, index, status) {
    let cell = row.insertCell(index);
    let text = "";
    let textClass = "";

    switch(status) {
        case 3:
            text = "Succeeded";
            textClass = "merge-success";
            break;
        default:
            text = "Failed";
            textClass = "merge-failed";
            break;
    }

    let node = document.createTextNode(text);
    cell.className = textClass;
    cell.appendChild(node);
};

var createTextCell = function (row, index, text) {
    let cell = row.insertCell(index);
    let textNode = document.createTextNode(text);
    cell.appendChild(textNode);
};

var createVotesCell = function (row, index, pullRequest) {
    let cell = row.insertCell(index);
    for (let i = 0; i < pullRequest.reviewers.length; i++) {
        let reviewerContainer = document.createElement("span");
        reviewerContainer.className = "reviewer-container";

        let reviewer = pullRequest.reviewers[i];
        let reviewImg = this.createImgElement(reviewer.imageUrl, reviewer.displayName);
        reviewerContainer.appendChild(reviewImg);
        if (reviewer.vote) {
            let voteElement = document.createElement("span");
            let voteClass = "";
            let voteText = "";
            switch(reviewer.vote) {
                case -10:
                    voteClass = "bowtie-status-failure";
                    voteText = "Rejected";
                    break;
                case -5:
                    voteClass = "bowtie-status-waiting-fill";
                    voteText = "Waiting for Author";
                    break;
                case 5:
                    voteClass = "bowtie-status-success-outline suggestions";
                    voteText = "Approved with Suggestions";
                    break;
                case 10:
                    voteClass = "bowtie-status-success";
                    voteText = "Approved";
                    break;
            }
            voteElement.className = `bowtie-icon ${voteClass} vote-overlay vote`;
            voteElement.title = voteText;
            reviewerContainer.appendChild(voteElement);
        }
        cell.appendChild(reviewerContainer);
    }
};

var insertPullRequestRow = function (table, pullRequest, index, baseUri) {
    let repoUrl = `${baseUri}/_git/${pullRequest.repository.name}`;
    let pullUrl = `${baseUri}/_git/${pullRequest.repository.id}/pullRequest/${pullRequest.pullRequestId}`;
    let idValue = `<a href="${pullUrl}" target="_parent">${pullRequest.pullRequestId}</a>`;

    let date = new Date(pullRequest.creationDate);
    let dateValue = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

    var reviewers = "";
    for (let i = 0; i < pullRequest.reviewers.length; i++) {
        reviewers += `<img class="row-image" src="${pullRequest.reviewers[i].imageUrl}" />`;
    }

    let cell = 0;
    let row = table.insertRow(index);

    this.createAnchorCell(row, cell++, pullRequest.pullRequestId, pullUrl);
    this.createImgCell(row, cell++, pullRequest.createdBy.imageUrl, pullRequest.createdBy.displayName);
    this.createAnchorCell(row, cell++, pullRequest.repository.name, repoUrl);
    this.createAnchorCell(row, cell++, pullRequest.title, pullUrl);
    this.createTextCell(row, cell++, dateValue);
    this.createBranchCell(row, cell++, pullRequest, baseUri);
    this.createMergeStatusCell(row, cell++, pullRequest.mergeStatus);
    this.createVotesCell(row, cell++, pullRequest);
    this.createCommentsCell(row, cell++, index, pullRequest);
};

VSS.ready(() => {
    VSS.require([
        "VSS/Service",
        "TFS/VersionControl/GitRestClient"
        ],
        function (vssService, gitClient) {
            var context = VSS.getWebContext();
            var gitHttpClient = vssService.getCollectionClient(gitClient.GitHttpClient);

            gitHttpClient.getPullRequestsByProject(context.project.name)
                .then(
                    pullRequests => {
                        let baseUri = `${context.host.uri + context.project.name}`;
                        let table = document.getElementById("pull-request-table-body");

                        for(let i = 0; i < pullRequests.length; i++) {
                            this.insertPullRequestRow(table, pullRequests[i], i, baseUri);
                        }

                        return pullRequests;
                    }
                )
                .then(
                    pullRequests => {
                        VSS.notifyLoadSucceeded();
                        return pullRequests;
                    }
                )
                .then(
                    pullRequests => {
                        let requests = [];
                        for (let i = 0; i < pullRequests.length; i++) {
                            let pullRequest = pullRequests[i];
                            requests.push(
                                gitHttpClient.getThreads(pullRequest.repository.id, pullRequest.pullRequestId)
                                    .then(
                                        threads => {
                                            let pullComments = 0;
                                            let unresolvedComments = 0;

                                            for (let j = 0; threads.length > j; j++) {

                                                let thread = threads[j];
                                                if (!thread.properties["Microsoft.TeamFoundation.Discussion.UniqueID"]) { continue; }
                                                if (thread.isDeleted) { continue; }

                                                let status = +thread.status;
                                                if (status >= 0) {
                                                    pullComments++;
                                                    switch(status) {
                                                        case 0:
                                                        case 1:
                                                        case 6:
                                                            unresolvedComments++;
                                                            break;
                                                    }
                                                }
                                            }

                                            let element = document.getElementById(`${i}|commentCount`);
                                            let icon = document.getElementById(`${i}|commentIcon`);
                                            if (element) {
                                                if (pullComments > 0) {
                                                    if (unresolvedComments == 0) {
                                                        element.textContent = "All resolved";
                                                        if (icon) {
                                                            icon.className = icon.className.replace("no-display", "");
                                                        }
                                                        let cell = document.getElementById(`${i}|commentCell`);
                                                        if (cell) {
                                                            cell.className += " comments-resolved";
                                                        }
                                                    }
                                                    else {
                                                        element.textContent = `${pullComments - unresolvedComments}/${pullComments} resolved`;
                                                        if (icon) {
                                                            icon.className += " comments-unresolved";
                                                            icon.className = icon.className.replace("no-display", "");
                                                        }
                                                    }
                                                }

                                                else {
                                                    element.textContent = "";

                                                }
                                            }
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