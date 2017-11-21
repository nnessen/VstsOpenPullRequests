export class DocumentService {

    addClass(element: HTMLElement, className: string) {
        element.className += ` ${className}`;
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

    createTextElement(text:string): Text {
        return document.createTextNode(text);
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
        this.addClass(element, "no-display");
    }

    removeClass(element: HTMLElement, className: string) {
        element.className = element.className.replace(className, "").replace("  ", " ").trim();
    }

    showElement(element: HTMLElement) {
        this.removeClass(element, "no-display");
    }
}