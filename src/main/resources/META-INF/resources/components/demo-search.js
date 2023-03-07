import {LitElement, html, css} from 'lit';
import '@vaadin/icon';
import '@vaadin/button';
import '@vaadin/text-field';
import '@vaadin/text-area';
import '@vaadin/form-layout';
import '@vaadin/progress-bar';
import '@vaadin/checkbox';
import {until} from 'lit/directives/until.js';
import '@vaadin/grid';
import '@vaadin/grid/vaadin-grid-sort-column.js';
import './demo-drink.js';
import './qui-alert.js';

export class DemoSearch extends LitElement {
    static styles = css`
      .grid {
        margin-top: 10px;
        padding: 10px;
        background: #EFE3CF81;
        border-radius: 5px;
      }

      h2 {
        font-family: Pacifico, fantasy;
        text-align: left;
        color: var(--main-highlight-text-color);
      }
    `;

    static properties = {
        "_results": {state: true, type: Array},
    }

    connectedCallback() {
        super.connectedCallback();
        this._results = [];
    }


    _fetch(query) {
        fetch("/coffeeshop/query?query=" + query)
            .then(response => {
                return response.json();
            })
            .then(json => {
                this._results = json;
            });
    }

    render() {
        return html`
            <div class="grid">
                <h2>Search</h2>
                <vaadin-text-field placeholder="Search"
                                   @value-changed="${e => {
                                       const searchTerm = (e.detail.value || '').trim();
                                       if (searchTerm.length === 0) {
                                           this._results = [];
                                       } else {
                                           this._fetch(searchTerm);
                                       }
                                   }}"
                >
                    <vaadin-icon slot="prefix" icon="font-awesome-solid:magnifying-glass"></vaadin-icon>
                </vaadin-text-field>
                ${this._results.map(p => this._renderProduct(p))}
            </div>`;

    }

    _renderProduct(product) {
        return html`
            <p><strong>${product.name}</strong>: ${product.description}</p>
        `
    }


}

customElements.define('demo-search', DemoSearch);

