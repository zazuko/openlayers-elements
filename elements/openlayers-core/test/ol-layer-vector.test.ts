import {expect, fixture} from '@open-wc/testing'
import {html} from 'lit-html'
import OlLayerVector from '../ol-layer-vector'
import '../ol-layer-vector'
import '@openlayers-elements/maps/ol-map'
import './test-elements/ol-test-feature'
import {forEvent} from '../../../test/util'

const dotUrl = 'https://openlayers.org/en/latest/examples/data/dot.png'

describe('ol-layer-vector', () => {
  it('should add markers to the layer', async () => {
    // given
    const element = (await fixture(html`
      <ol-map>
        <ol-layer-vector>
          <ol-test-feature src="${dotUrl}"></ol-test-feature>
          <ol-test-feature src="${dotUrl}"></ol-test-feature>
          <ol-test-feature src="${dotUrl}"></ol-test-feature>
          <ol-test-feature src="${dotUrl}"></ol-test-feature>
        </ol-layer-vector>
      </ol-map>
    `)).querySelector('ol-layer-vector') as OlLayerVector
    await forEvent(element.querySelector('ol-test-feature:nth-of-type(4)'), 'attached')

    // then
    expect(element.source.getFeatures().length).to.equal(4)
  })

  it('should remove markers from layer when node is removed', async () => {
    // given
    const element = (await fixture(html`
      <ol-map>
        <ol-layer-vector>
          <ol-test-feature src="${dotUrl}"></ol-test-feature>
          <ol-test-feature src="${dotUrl}"></ol-test-feature>
          <ol-test-feature src="${dotUrl}"></ol-test-feature>
          <ol-test-feature src="${dotUrl}"></ol-test-feature>
        </ol-layer-vector>
      </ol-map>
    `)).querySelector('ol-layer-vector') as OlLayerVector
    await forEvent(element.querySelector('ol-test-feature:nth-of-type(4)'), 'attached')

    // when
    element.removeChild(element.querySelector('ol-test-feature'))

    // then
    expect(element.source.getFeatures().length).to.equal(3)
  })

  it('should handle markers added dynamically', async () => {
    // given
    const element = (await fixture(
      html`
        <ol-map>
          <ol-layer-vector></ol-layer-vector>
        </ol-map>
      `,
    )).querySelector('ol-layer-vector') as OlLayerVector

    // when
    const marker = document.createElement('ol-test-feature')
    element.appendChild(marker)
    await forEvent(marker, 'attached')

    // then
    expect(element.source.getFeatures().length).to.equal(1)
  })
})
