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
import {columnBodyRenderer} from '@vaadin/grid/lit.js';
import '@vaadin/grid/vaadin-grid-sort-column.js';

export class DemoDrink extends LitElement {
    static styles = css`
      .card {
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border: 2px solid var(--main-highlight-text-color);
        border-radius: 4px;
        width: 290px;
        filter: brightness(90%);
      }

      .card-header {
        height: 25px;
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        font-family: Pacifico, fantasy;
        text-align: center;
        margin-left: auto;
        margin-right: auto;
        color: var(--main-highlight-text-color);
      }

      .image {
        margin-left: auto;
        margin-right: auto;
        display: inline-block;
        vertical-align: top;
      }

      .image img {;
        border-radius: 50%;
        width: 100px;
        float: left;
      }

      .description-block {
        display: inline-block;
        margin-left: auto;
        margin-right: auto;
      }
      
      .description {
        text-align: justify;
        padding-left: 10px;
        padding-right: 10px;
      }
      
      .button {
        display: inline-block;
        float: right;
        margin-right: 5px;
        margin-bottom: 5px;
      }
      
      .active:hover {
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
      }

      .active .card-header {
        color: var(--lumo-contrast);
      }

    `;

    channel = new BroadcastChannel("order-notification");

    static properties = {
        name: {type: String},
        description: {type: String},
        picture: {type: String},
        price: {type: Number}
    }

    constructor() {
        super();
    }

    render() {
        return html`
            <div class="card">
                <h2 class="card-header">${this.name}</h2>
                <div class="image">
                    <img src="${this.picture}"/>
                </div>
                <div class="description-block">
                    <div class="description">
                        <p>${this.description}</p>
                    </div>
                </div>
                <div class="button">
                    <vaadin-button @click=${() => this._buy()} class="button">
                        <vaadin-icon icon="font-awesome-solid:mug-saucer"></vaadin-icon> $${this.price}
                    </vaadin-button>
                </div>
            </div>`;
    }

    _buy() {
        const name = this.name;
        const data = {
            "product" : name,
            "price": this.price
        };
        fetch("/coffeeshop/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((resp) => {
                this.channel.postMessage({
                    "order": name,
                    "success": true
                });
            })
            .catch((error) => {
                this.channel.postMessage({
                    "order": name,
                    "success": false
                });
            });
    }


}

customElements.define('demo-drink', DemoDrink);

