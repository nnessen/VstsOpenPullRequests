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
}