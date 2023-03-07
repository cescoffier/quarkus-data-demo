import { LitElement, html, css} from 'lit';
import '@vaadin/icon';
import '@vaadin/button';
import '@vaadin/text-field';
import '@vaadin/text-area';
import '@vaadin/form-layout';
import '@vaadin/progress-bar';
import '@vaadin/checkbox';
import { until } from 'lit/directives/until.js';
import '@vaadin/grid';
import { columnBodyRenderer } from '@vaadin/grid/lit.js';
import '@vaadin/grid/vaadin-grid-sort-column.js';

export class DemoComponent extends LitElement {
    render() {
        return html`<p>
            <vaadin-button theme="primary error">
                <vaadin-icon class="clearIcon" icon="font-awesome-solid:broom"></vaadin-icon> Clear
            </vaadin-button>
            
        </p>`
    }


}
customElements.define('demo-component', DemoComponent);

