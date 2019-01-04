import { DocumentService } from './document.service';

export class TableService {

    table: HTMLTableElement;

    constructor(
        private documentService: DocumentService,
        private baseUri: string
    ) {
        this.table = this.documentService.findElement<HTMLTableElement>("pull-request-table-body");
    }

    private createPullRequestCell(
        row: HTMLTableRowElement,
        cellIndex: number,
        rowIndex: number,
        pullUrl: string,
        repoUrl: string,
        pullRequest
    ) {
        let cell = this.createCell(row, cellIndex);
        cell.id = `${rowIndex}|pullRequestCell`;

        let container = this.documentService.createDivElement();
        container.className = "flex-container";

        let author = this.documentService.createImgElement();
        author.src = pullRequest.createdBy.imageUrl;
        author.alt = pullRequest.createdBy.displayName;
        author.title = author.alt;
        author.className = "author-image";
        container.appendChild(author);

        let subContainer = this.documentService.createDivElement();
        subContainer.className = "flex-container vertical flex-fill";

        let titleContainer = this.documentService.createSpanElement();
        titleContainer.className = "flex-fill";
        let title = this.documentService.createAnchorElement();
        title.href = pullUrl;
        title.text = pullRequest.title;
        title.target = "_parent";
        titleContainer.appendChild(title);
        subContainer.appendChild(titleContainer);

        let gitContainer = this.documentService.createDivElement();
        gitContainer.className = "git-row flex-fill";

        let repo = this.documentService.createSpanElement();
        repo.className = "bowtie-icon bowtie-git";
        repo.title = "Repository";
        let repoAnchor = this.documentService.createAnchorElement();
        repoAnchor.href = repoUrl;
        repoAnchor.text = pullRequest.repository.name;
        repoAnchor.target = "_parent";
        repoAnchor.className = "repo-link";
        repo.appendChild(repoAnchor);
        gitContainer.appendChild(repo);

        this.createBranch(gitContainer, pullRequest);

        subContainer.appendChild(gitContainer);
        container.appendChild(subContainer);

        cell.appendChild(container);
    }

    private addNewRow(table: HTMLTableElement, pullRequest, rowIndex: number) {

        let repoUrl = `${this.baseUri}/_git/${pullRequest.repository.name}`;
        let pullUrl = `${this.baseUri}/_git/${pullRequest.repository.id}/pullRequest/${pullRequest.pullRequestId}`;

        let cell = 0;
        let row = table.insertRow(rowIndex);

        this.createAnchorCell(row, cell++, pullRequest.pullRequestId, pullUrl);
        this.createPullRequestCell(row, cell++, rowIndex, pullUrl, repoUrl, pullRequest);
        this.createVotesCell(row, cell++, pullRequest);
        this.createPoliciesCell(row, cell++, rowIndex, pullRequest);
        this.createCommentsCell(row, cell++, rowIndex, pullRequest);
    }

    addRows(pullRequests: any[]) {
        for(let i = 0; i < pullRequests.length; i++) {
            this.addNewRow(this.table, pullRequests[i], i);
        }
    }

    clear() {
        this.documentService.removeChildren(this.table);
    }

    private createAnchorCell(row: HTMLTableRowElement, cellIndex: number, text: string, href: string): HTMLTableDataCellElement {
        let cell = this.createCell(row, cellIndex);
        let anchor = this.documentService.createAnchorElement();
        anchor.href = href;
        anchor.text = text;
        anchor.target = "_parent";
        cell.appendChild(anchor);

        return cell;
    }

    private createBranch(parent: HTMLElement, pullRequest) {
        let sourceBranch = pullRequest.sourceRefName.replace("refs/heads/", "");
        let targetBranch = pullRequest.targetRefName.replace("refs/heads/", "");

        let container = this.documentService.createSpanElement();
        let source = this.documentService.createSpanElement();
        let into = this.documentService.createSpanElement();
        let target = this.documentService.createSpanElement();

        source.className = "bowtie-icon bowtie-tfvc-branch";
        source.title = "Source Branch";
        let sourceLink = this.documentService.createAnchorElement();
        sourceLink.href = `${this.baseUri}/_git/${pullRequest.repository.name}#version=GB${sourceBranch}`;
        sourceLink.target = "_parent";
        sourceLink.text = sourceBranch;
        source.appendChild(sourceLink);

        into.className = "bowtie-icon bowtie-arrow-right pull-into";

        target.className = "bowtie-icon bowtie-tfvc-branch";
        target.title = "Target Branch";
        let targetLink = this.documentService.createAnchorElement();
        targetLink.href = `${this.baseUri}/_git/${pullRequest.repository.name}#version=GB${targetBranch}`;
        targetLink.target = "_parent";
        targetLink.text = targetBranch;
        target.appendChild(targetLink);

        let mergeStatus = this.documentService.createSpanElement();
        mergeStatus.classList.add("bowtie-icon", "merge-status");
        mergeStatus.classList.add("bowtie-icon", "merge-status");

        switch(pullRequest.mergeStatus) {
            case 0:
                break;
            case 1:
                mergeStatus.classList.add("bowtie-status-waiting-fill");
                mergeStatus.title = "Merge Queued";
                break;
            case 2:
                mergeStatus.classList.add("bowtie-status-failure");
                mergeStatus.title = "Merge Conflicts";
                break;
            case 3:
                mergeStatus.classList.add("bowtie-status-success");
                mergeStatus.title = "Merge Succeeded";
                break;
            case 4:
                mergeStatus.classList.add("bowtie-status-failure");
                mergeStatus.title = "Rejected by Policy";
                break;
            default:
                mergeStatus.classList.add("bowtie-status-failure");
                mergeStatus.title = "Merge Failed";
                break;
        }

        container.appendChild(source);
        container.appendChild(into);
        container.appendChild(target);
        container.appendChild(mergeStatus);

        parent.appendChild(container);
    }

    private createCell(row: HTMLTableRowElement, cellIndex: number): HTMLTableDataCellElement {
        return row.insertCell(cellIndex);
    }

    private createCommentsCell(row: HTMLTableRowElement, cellIndex: number, rowIndex: number, pullRequest) {
        let cell = this.createCell(row, cellIndex);
        cell.id = `${rowIndex}|commentCell`;
        cell.className = "comments";

        let icon = this.documentService.createSpanElement(`${rowIndex}|commentIcon`);
        icon.title = "Comments";
        icon.className = "bowtie-icon bowtie-comment-discussion comment-icon";
        this.documentService.hideElement(icon);

        let text = this.documentService.createSpanElement(`${rowIndex}|commentCount`);
        text.textContent = "";
        text.className = "comment-count";
        this.documentService.hideElement(text);

        let swirly = this.documentService.createDivElement(`${rowIndex}|swirly`);
        swirly.className = "swirly-balls small";

        cell.appendChild(icon);
        cell.appendChild(text);
        cell.appendChild(swirly);
    }

    private createPoliciesCell(row: HTMLTableRowElement, cellIndex: number, rowIndex: number, pullRequest) {
        let cell = this.createCell(row, cellIndex);
        cell.id = `${rowIndex}|policiesCell`;
        cell.className = "comments";

        let swirly = this.documentService.createDivElement(`${rowIndex}|policiesSwirly`);
        swirly.className = "swirly-balls small";

        let approved = this.documentService.createSpanElement(`${rowIndex}|policiesApproved`);
        approved.className = "reviewer-container approved";
        this.documentService.hideElement(approved);
        let approvedCircle = this.documentService.createSpanElement(`${rowIndex}|policiesApprovedCount`);
        approvedCircle.className = "row-image policy-type approved";
        approvedCircle.textContent = "";
        approvedCircle.title = "";
        approved.appendChild(approvedCircle);
        let approvedBadge = this.documentService.createSpanElement();
        approvedBadge.className = "bowtie-icon bowtie-status-success vote-overlay vote";
        approvedBadge.title = "Approved";
        approved.appendChild(approvedBadge);

        cell.appendChild(approved);
        cell.appendChild(swirly);
    }

    private createVotesCell(row: HTMLTableRowElement, cellIndex: number, pullRequest) {
        let cell = this.createCell(row, cellIndex);

        for (let i = 0; i < pullRequest.reviewers.length; i++) {

            let reviewerContainer = this.documentService.createSpanElement();
            reviewerContainer.className = "reviewer-container";

            let reviewer = pullRequest.reviewers[i];
            let reviewImg = this.documentService.createImgElement();
            reviewImg.src = reviewer.imageUrl;
            reviewImg.alt = reviewer.displayName;
            reviewImg.title = reviewer.displayName;
            reviewImg.className = "row-image";
            reviewerContainer.appendChild(reviewImg);

            if (reviewer.vote) {
                let voteElement = this.documentService.createSpanElement();
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
    }

    private getPolicyStatusClass(policyStatus: number) {
        switch(policyStatus) {
            case 3:
                return "failed";
            case 1:
                return "waiting";
            case 0:
                return "approved";
            default:
                return "other";
        }
    }

    private getPolicyStatusDisplayName(policyStatus: number) {
        switch(policyStatus) {
            case 3:
                return "REJECTED";
            case 1:
                return "WAITING";
            case 0:
                return "APPROVED";
            default:
                return "UNKNOWN";
        }
    }

    private getPolicyIcon(displayName: string) {
        displayName = displayName.toLowerCase();
        if (displayName.indexOf("build") >= 0) { return "bowtie-build"; }
        if (displayName.indexOf("merge") >= 0) { return "bowtie-tfvc-merge"; }
        if (displayName.indexOf("work item") >= 0) { return "bowtie-symbol-task"; }
        if (displayName.indexOf("comment") >= 0) { return "bowtie-comment"; }
        if (displayName.indexOf("required") >= 0) { return "bowtie-security"; }
        if (displayName.indexOf("reviewer") >= 0) { return "bowtie-users"; }

        return "bowtie-policy";
    }

    updateComments(rowIndex: number, threads: any[]) {
        let pullComments = 0;
        let unresolvedComments = 0;

        for (let j = 0; threads.length > j; j++) {

            let thread = threads[j];
            if (!thread.properties) { continue; }
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

        this.documentService.findAndHideElement(`${rowIndex}|swirly`);

        let element = this.documentService.findElement(`${rowIndex}|commentCount`);
        let icon = this.documentService.findElement(`${rowIndex}|commentIcon`);
        if (element) {
            if (pullComments > 0) {
                this.documentService.showElement(element);

                if (unresolvedComments == 0) {
                    element.textContent = "All resolved";
                    if (icon) {
                        this.documentService.showElement(icon);
                    }
                    let cell = this.documentService.findElement(`${rowIndex}|commentCell`);
                    if (cell) {
                        this.documentService.addClass(cell, "comments-resolved");
                    }
                }
                else {
                    element.textContent = `${pullComments - unresolvedComments}/${pullComments} resolved`;
                    if (icon) {
                        this.documentService.addClass(icon, "comments-unresolved");
                        this.documentService.showElement(icon);
                    }
                }
            }
        }
    }

    updatePolicies(rowIndex: number, policies) {
        this.documentService.findAndHideElement(`${rowIndex}|policiesSwirly`);

        let cell = this.documentService.findElement(`${rowIndex}|policiesCell`);
        let policyStatuses = {
            approved: 0,
            queued: 1,
            running: 1,
            rejected: 3,
            broken: 3
        };
        let policyCount = 0;
        let policyTypes = {};
        if (policies && policies.value && policies.value.length) {
            for (let i = 0; i < policies.value.length; i++) {
                let policy = policies.value[i];
                if (!policyTypes[policy.configuration.type.displayName] ||
                    (policyTypes[policy.configuration.type.displayName] &&
                     policyStatuses[policy.status] > policyTypes[policy.configuration.type.displayName])
                ) {
                    policyTypes[policy.configuration.type.displayName] = policyStatuses[policy.status];
                }
            }

            let approved = [];
            for (let policyType in policyTypes) {
                policyCount++;
                if (policyTypes[policyType] == 0) {
                    approved = approved.concat(policyType);
                }
                else {
                    let policyContainer = this.documentService.createSpanElement();
                    policyContainer.className = "reviewer-container"
                    let policyHolder = this.documentService.createSpanElement();
                    let icon = this.getPolicyIcon(policyType);
                    let color = this.getPolicyStatusClass(policyTypes[policyType]);
                    policyHolder.className = `row-image policy-type bowtie-icon ${icon} ${color}`;
                    policyHolder.title = `${policyType}\n${this.getPolicyStatusDisplayName(policyTypes[policyType])}`;
                    policyContainer.appendChild(policyHolder);
                    cell.appendChild(policyContainer);
                }
            }
            if (approved.length) {
                let approvedElement = this.documentService.findElement(`${rowIndex}|policiesApprovedCount`);
                if (approvedElement) {
                    if (approved.length == policyCount) {
                        approvedElement.textContent = "All";
                        this.documentService.addClass(approvedElement, "all-approved");
                    }
                    else {
                        approvedElement.textContent = approved.length.toString();
                    }
                    approvedElement.title = approved.join("\n");
                    this.documentService.findAndShowElement(`${rowIndex}|policiesApproved`);
                }
            }
        }
    }
}
