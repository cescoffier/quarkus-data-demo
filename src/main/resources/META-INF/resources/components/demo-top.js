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

export class DemoTop extends LitElement {
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
        "_top": {state: true, type: Array},
    }

    channel = new BroadcastChannel("order-notification");


    constructor() {
        super();
        this._top = [];
    }

    connectedCallback() {
        super.connectedCallback();
        this.channel.addEventListener("message", (event) => {
            this._fetch();
        });
        this._fetch();
    }

    _fetch() {
        fetch("/coffeeshop/top")
            .then(response => {
                return response.json();
            })
            .then(json => {
                if (! json) {
                    this._top = [];
                } else {
                    this._top = json;
                }
            });
    }

    render() {
        console.log("top is", this._top);
        return html`
            <div class="grid">
                <h2>Top Products</h2>
                ${this._top.map(product => this._renderProduct(product))}
            </div>`;
    }

    _renderProduct(product) {
        return html`
            <p>${product.value} (${product.score})</p>
        `
    }


}

customElements.define('demo-top', DemoTop);

