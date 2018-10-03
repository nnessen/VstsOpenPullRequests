import { DocumentService } from './document.service';

export class TableService {

    table: HTMLTableElement;

    constructor(
        private documentService: DocumentService,
        private baseUri: string
    ) {
        this.table = this.documentService.findElement<HTMLTableElement>("pull-request-table-body");
    }

    private addNewRow(table: HTMLTableElement, pullRequest, rowIndex: number) {

        let repoUrl = `${this.baseUri}/_git/${pullRequest.repository.name}`;
        let pullUrl = `${this.baseUri}/_git/${pullRequest.repository.id}/pullRequest/${pullRequest.pullRequestId}`;
        let idValue = `<a href="${pullUrl}" target="_parent">${pullRequest.pullRequestId}</a>`;

        let date = new Date(pullRequest.creationDate);
        let dateValue = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

        var reviewers = "";
        for (let i = 0; i < pullRequest.reviewers.length; i++) {
            reviewers += `<img class="row-image" src="${pullRequest.reviewers[i].imageUrl}" />`;
        }

        let cell = 0;
        let row = table.insertRow(rowIndex);

        this.createAnchorCell(row, cell++, pullRequest.pullRequestId, pullUrl);
        this.createImgCell(row, cell++, pullRequest.createdBy.imageUrl, pullRequest.createdBy.displayName);
        this.createAnchorCell(row, cell++, pullRequest.repository.name, repoUrl);
        this.createAnchorCell(row, cell++, pullRequest.title, pullUrl);
        this.createTextCell(row, cell++, dateValue);
        this.createBranchCell(row, cell++, pullRequest);
        this.createVotesCell(row, cell++, pullRequest);
        this.createPoliciesCell(row, cell++, rowIndex, pullRequest);
        this.createCommentsCell(row, cell++, rowIndex, pullRequest);
    }

    addRows(pullRequests: any[]) {
        for(let i = 0; i < pullRequests.length; i++) {
            this.addNewRow(this.table, pullRequests[i], i);
        }
    }

    private capitalizeFirstLetter(string: string) {
        return string.charAt(0).toUpperCase().concat(string.slice(1));
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

    private createBranchCell(row: HTMLTableRowElement, cellIndex: number, pullRequest) {
        let cell = this.createCell(row, cellIndex);
        let sourceBranch = pullRequest.sourceRefName.replace("refs/heads/", "");
        let targetBranch = pullRequest.targetRefName.replace("refs/heads/", "");

        let container = this.documentService.createSpanElement();
        let source = this.documentService.createSpanElement();
        let into = this.documentService.createSpanElement();
        let target = this.documentService.createSpanElement();

        source.className = "bowtie-icon bowtie-tfvc-branch";
        let sourceLink = this.documentService.createAnchorElement();
        sourceLink.href = `${this.baseUri}/_git/${pullRequest.repository.name}#version=GB${sourceBranch}`;
        sourceLink.target = "_parent";
        sourceLink.text = sourceBranch;
        source.appendChild(sourceLink);

        into.className = "bowtie-icon bowtie-arrow-right pull-into";

        target.className = "bowtie-icon bowtie-tfvc-branch";
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
        cell.appendChild(container);
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

    private createImgCell(row: HTMLTableRowElement, cellIndex: number, src: string, tooltip: string) {
        let cell = this.createCell(row, cellIndex);
        let img = this.documentService.createImgElement();
        img.src = src;
        img.className = "row-image";
        img.alt = tooltip;
        img.title = tooltip;
        cell.appendChild(img);
    }

    private createPoliciesCell(row: HTMLTableRowElement, cellIndex: number, rowIndex: number, pullRequest) {
        let cell = this.createCell(row, cellIndex);
        cell.id = `${rowIndex}|policiesCell`;
        cell.className = "comments";

        let icon = this.documentService.createSpanElement(`${rowIndex}|policiesIcon`);
        icon.title = "Policies";
        icon.className = "bowtie-icon bowtie-policy comment-icon";
        this.documentService.hideElement(icon);

        let none = this.documentService.createSpanElement(this.getNoPoliciesId(rowIndex));
        none.className = "policy-count";
        none.textContent = "N/A";
        this.documentService.hideElement(none);

        let approved = this.createPolicyStatus(rowIndex, "approved", "success");
        this.documentService.hideElement(approved);

        let waiting = this.createPolicyStatus(rowIndex, "waiting", "waiting-fill");
        this.documentService.hideElement(waiting);

        let rejected = this.createPolicyStatus(rowIndex, "rejected", "failure");
        this.documentService.hideElement(rejected);

        let other = this.createPolicyStatus(rowIndex, "other", "help-outline");
        this.documentService.hideElement(other);

        let swirly = this.documentService.createDivElement(`${rowIndex}|policiesSwirly`);
        swirly.className = "swirly-balls small";

        cell.appendChild(icon);

        cell.appendChild(none);
        cell.appendChild(approved);
        cell.appendChild(waiting);
        cell.appendChild(rejected);
        cell.appendChild(other);

        cell.appendChild(swirly);
    }

    private createPolicyStatus(rowIndex: number, status: string, icon: string) {
        let policyContainer = this.documentService.createSpanElement(this.getPolicyContainerId(rowIndex, status));
        policyContainer.className = "policy-status";

        let policyCount = this.documentService.createSpanElement(this.getPolicyCountId(rowIndex, status));
        policyCount.className = "policy-count"
        policyCount.textContent = "0";
        policyContainer.appendChild(policyCount);

        let policyIcon = this.documentService.createSpanElement(this.getPolicyIconId(rowIndex, status));
        policyIcon.className = `bowtie-icon bowtie-status-${icon}`;
        policyIcon.title = this.capitalizeFirstLetter(status);
        policyContainer.appendChild(policyIcon);

        return policyContainer;
    }

    private createTextCell(row: HTMLTableRowElement, cellIndex: number, text: string) {
        let cell = this.createCell(row, cellIndex);
        let textNode = this.documentService.createTextElement(text);
        cell.appendChild(textNode);
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

    private getNoPoliciesId(rowIndex: number) {
        return `${rowIndex}|policies|N/A`;
    }

    private getPolicyContainerId(rowIndex: number, status: string) {
        return `${rowIndex}|policies|${status}`;
    }

    private getPolicyCountId(rowIndex: number, status: string) {
        return `${rowIndex}|policies|${status}Count`;
    }

    private getPolicyIconId(rowIndex: number, status: string) {
        return `${rowIndex}|policies|${status}Icon`;
    }

    updateComments(rowIndex: number, threads: any[]) {
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

        let policyStatuses = {
            approved: { count: 0, names: [] },
            waiting: { count: 0, names: [] },
            rejected: { count: 0, names: [] },
            other: { count: 0, names: [] }
        }

        if (policies && policies.value && policies.value.length) {
            for(let i = 0; i < policies.value.length; i++) {
                let policy = policies.value[i];
                switch(policy.status) {
                    case "approved":
                        policyStatuses.approved.count++;
                        policyStatuses.approved.names = policyStatuses.approved.names.concat(
                            policy.configuration.type.displayName
                        );
                        break;
                    case "broken":
                    case "rejected":
                        policyStatuses.rejected.count++;
                        policyStatuses.rejected.names = policyStatuses.rejected.names.concat(
                            policy.configuration.type.displayName
                        );
                        break;
                    case "queued":
                    case "running":
                        policyStatuses.waiting.count++;
                        policyStatuses.waiting.names = policyStatuses.waiting.names.concat(
                            policy.configuration.type.displayName
                        );
                        break;
                    default:
                        policyStatuses.other.count++;
                        policyStatuses.other.names = policyStatuses.other.names.concat(
                            policy.configuration.type.displayName
                        );
                        break;
                }
            }
        } else {
            this.documentService.findAndShowElement(`${rowIndex}|policiesIcon`);
            this.documentService.findAndShowElement(this.getNoPoliciesId(rowIndex));
            return;
        }

        let icon: HTMLSpanElement = this.documentService.findElement(`${rowIndex}|policiesIcon`);
        if (icon) {
            if (policyStatuses.rejected.count) {
                this.documentService.addClass(icon, "rejected");
            } else if (policyStatuses.waiting.count) {
                this.documentService.addClass(icon, "comments-unresolved");
            } else {
                let cell = this.documentService.findElement(`${rowIndex}|policiesCell`);
                if (cell) {
                    this.documentService.addClass(cell, "comments-resolved");
                }
            }
            this.documentService.showElement(icon);
        }

        let cell = this.documentService.findElement(`${rowIndex}|policiesCell`);
        cell.title = "";
        for(let policyStatus in policyStatuses) {
            if (policyStatuses[policyStatus].count) {
                let statusCount = this.documentService.findElement(this.getPolicyCountId(rowIndex, policyStatus));
                if (statusCount) {
                    statusCount.textContent = policyStatuses[policyStatus].count;
                    if (cell.title) {
                        cell.title += "\n";
                    }
                    cell.title += `${policyStatus.toLocaleUpperCase()}:\n`;
                    policyStatuses[policyStatus].names.forEach(
                        name => {
                            cell.title += `${name}\n`;
                        }
                    );
                }
                this.documentService.findAndShowElement(this.getPolicyContainerId(rowIndex, policyStatus));
            }
        }
    }
}