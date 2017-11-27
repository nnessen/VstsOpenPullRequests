export class DocumentService {

    static hideClass = "no-display";

    addClass(element: HTMLElement, className: string) {
        element.classList.add(className);
    }

    createAnchorElement(id?: string): HTMLAnchorElement {
        return <HTMLAnchorElement>this.createElement("a", id);
    }

    createDivElement(id?: string): HTMLDivElement {
        return <HTMLDivElement>this.createElement("div", id);
    }

    private createElement(tag: string, id?: string): HTMLElement {
        let element = document.createElement(tag);
        if (id) {
            element.id = id;
        }
        return element;
    }

    createImgElement(id?: string): HTMLImageElement {
        return <HTMLImageElement>this.createElement("img", id);
    }

    createSpanElement(id?: string): HTMLSpanElement {
        return <HTMLSpanElement>this.createElement("span", id);
    }

    createTextElement(text: string): Text {
        return document.createTextNode(text);
    }

    disableButton(element: HTMLButtonElement) {
        element.disabled = true;
    }

    enableButton(element: HTMLButtonElement) {
        element.disabled = false;
    }

    findAndHideElement(id: string) {
        let element = this.findElement(id);
        if (element) {
            this.hideElement(element);
        }
    }

    findAndShowElement(id: string) {
        let element = this.findElement(id);
        if (element) {
            this.showElement(element);
        }
    }

    findElement<T extends HTMLElement>(id: string): T {
        return <T>document.getElementById(id);
    }

    hideElement(element: HTMLElement) {
        this.addClass(element, DocumentService.hideClass);
    }

    removeChildren(element: HTMLElement) {
        while(element.lastChild) {
            element.removeChild(element.lastChild);
        }
    }

    removeClass(element: HTMLElement, className: string) {
        element.classList.remove(className);
    }

    showElement(element: HTMLElement) {
        this.removeClass(element, DocumentService.hideClass);
    }
}