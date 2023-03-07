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

export class DemoOrders extends LitElement {
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
        "_orders": {state: true, type: Array},
    }

    channel = new BroadcastChannel("order-notification");


    connectedCallback() {
        super.connectedCallback();
        this.channel.addEventListener("message", (event) => {
           this._fetch();
        });
        this._fetch();
    }

    _fetch() {
        fetch("/coffeeshop/orders")
            .then(response => {
                return response.json();
            })
            .then(json => {
                console.log("orders", json);
                this._orders = json;
            });
    }

    render() {
        return html`${until(this._render(), html`<span>Loading orders...</span>`)}`;
    }

    _render() {
        if (this._orders) {
            return html`
                <div class="grid">
                    <h2>Orders</h2>
                    ${this._orders.map(order => this._renderOrder(order))}
                </div>`;
        }
    }

    _renderOrder(order) {
        return html`
            <p>Processed the order of  a <strong>${order.product}</strong> - Order id: ${order.id}, Order time: ${order.time}</p>
        `
    }


}

customElements.define('demo-orders', DemoOrders);

