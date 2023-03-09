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
import './echarts/echarts-pie.js';

export class DemoTop extends LitElement {
    static styles = css`
      .grid {
        padding: 10px;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      h2 {
        font-family: Pacifico, fantasy;
        text-align: left;
        color: var(--main-highlight-text-color);
      }
    
      echarts-pie {
        width: 400px;
        height: 400px;
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
        super.render();
        console.log("top is", this._top);
        const titles = [];
        const values = [];
        for (var i = 0; i < this._top.length; i++) {
            let t = this._top[i];
            titles.push(t.value);
            values.push(t.score);
        }
        if(this._top.length>0){
            return html`
                <div class="grid">
                    <div>
                        <h2>Top Products</h2>
                        <echarts-pie name = "Top Products"
                            sectionTitles="${titles.toString()}" 
                            sectionValues="${values.toString()}">
                        </echarts-pie>
                    </div>
                </div>`;
        }
    }

}

customElements.define('demo-top', DemoTop);

