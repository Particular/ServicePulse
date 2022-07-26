export default class EventLogItemComponent extends HTMLElement {

    constructor() {
        super();

        // Load the template element and clone it
        let template: any = document.getElementById('event-log-item-template');
        if (template != null) {
            this.append(template.content.cloneNode(true));
        }

        this.replaceSlots(this);
    }

    replaceSlots(parent: any) {
        const data: any = {};

        // Get slot values that web component has defined
        parent.querySelectorAll('[slot]').forEach((el: any)  => {
            data[el.getAttribute('slot').replace(/-(\w)/g, (_$0: any, $1: string) => $1.toUpperCase())] = el;
        });

        const elementToReplaceSlotsOn: any = this.children[this.children.length - 1];

        // Replace the slots in the template with the ones defined by the web component
        for (var slot in data) {
            const id = data[slot].slot;
            const slotToReplace = elementToReplaceSlotsOn.querySelector(`slot[name="${id}"]`);
            slotToReplace.replaceWith(data[slot]);
        }
    }
}