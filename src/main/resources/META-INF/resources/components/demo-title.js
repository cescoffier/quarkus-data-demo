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

export class DemoTitle extends LitElement {

    static styles = css`
      h1 {
        font-family: Pacifico, fantasy;
        font-size: 60px;
        font-style: normal;
        font-variant: normal;
        font-weight: 700;
        line-height: 26.4px;
        color: var(--main-highlight-text-color);
      }

      .title {
        text-align: center;
        padding: 1em;
        background: #C3B9A9;
        background: -moz-linear-gradient(top, #C3B9A9 0%, #CCC2B1 13%, #F3EADB 100%);
        background: -webkit-linear-gradient(top, #C3B9A9 0%, #CCC2B1 13%, #F3EADB 100%);
        background: linear-gradient(to bottom, #C3B9A9 0%, #CCC2B1 13%, #F3EADB 100%);
      }
    `

    render() {
        return html`
            <div class="title">
                <h1>CoffeeShop!</h1>
            </div>
        `
    }


}

customElements.define('demo-title', DemoTitle);

