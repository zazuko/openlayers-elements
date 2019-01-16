import { storiesOf } from '@storybook/polymer';
import { html } from 'lit-html'

import '../elements/ol-swiss-cantons'

storiesOf('ol-swiss-cantons', module)
    .add('standard map', () => {
        return html`<ol-swiss-cantons style="max-width: 700px"></ol-swiss-cantons>`
    });
