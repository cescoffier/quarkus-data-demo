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

export class DemoDrinks extends LitElement {
    static styles = css`
      .grid {
        display: flex;
        flex-wrap: wrap;
        gap: 20px;
        padding: 10px;
        background: #EFE3CF81;
        border-radius: 5px;
      }

      .description {
        padding-bottom: 10px;
      }

      .card-content {
        color: var(--lumo-contrast-90pct);
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        padding: 10px 10px;
        height: 100%;
      }

      .card-content slot {
        display: flex;
        flex-flow: column wrap;
        padding-top: 5px;
      }
    `;

    static properties = {
        "_drinks": {state: true, type: Array},
        "_notification": {state: true}
    }

    channel = new BroadcastChannel("order-notification");


    connectedCallback() {
        super.connectedCallback();
        this.channel.addEventListener("message", (event) => {
            const  data= event.data;
            console.log(data);
            if (data.success) {
                this._notification = html`
                    <qui-alert theme="success" dismissible showIcon>
                        <p>${data.order} ordered successfully</p>
                    </qui-alert>`
            } else {
                this._notification = html`
                    <qui-alert theme="danger" dismissible showIcon>
                        <p>Unable to order ${data.order}</p>
                    </qui-alert>`
            }
        });

        const prices = new EventSource("/coffeeshop/prices");
        prices.onmessage = (event) => {
            this._drinks = JSON.parse(event.data);
        }

        fetch("/coffeeshop/drinks")
            .then(response => {
               return response.json();
            })
            .then(json => {
                this._drinks = json;
            });
    }

    render() {
        return html`${until(this._render(), html`<span>Loading drinks...</span>`)}`;
    }

    _render() {
        if (this._drinks) {

            return html`
                <div class="notifications">${this._notification}</div>
                <div class="grid">
                    ${this._drinks.map(drink => this._renderDrink(drink))}
                </div>`;
        }
    }

    _renderDrink(drink) {
        return html`
            <demo-drink
                    clazz="drink"
                    name="${drink.name}"
                    description="${drink.description}"
                    picture="${drink.picture}"
                    price="${drink.price}"
            >
            </demo-drink>`;
    }


}

customElements.define('demo-drinks', DemoDrinks);

