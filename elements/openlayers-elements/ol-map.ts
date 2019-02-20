import {html, LitElement, property, query} from 'lit-element'
import Base from 'ol/layer/base'
import OpenLayersMap from 'ol/Map'
// @ts-ignore
import {fromLonLat, get as getProjection} from 'ol/proj'
import View from 'ol/View'
import ResizeObserver from 'resize-observer-polyfill'
import OlLayerBase from './ol-layer-base'

function addPart(this: OlMap, node) {
    node.createPart().then((part) => {
        node.constructor.addToMap(part, this.map)
        this.parts.set(node, part)
    })
}

function updateParts(this: OlMap, mutationList: MutationRecord[]) {
    mutationList
        .filter((m) => m.type === 'childList')
        .forEach((mutation) => {
            mutation.removedNodes.forEach((node: any) => {
                if (this.parts.has(node)) {
                    node.constructor.removeFromMap(this.parts.get(node), this.map)
                    this.parts.delete(node)
                }
            })
            const addedNodes = [...mutation.addedNodes]
            addedNodes
                .filter((n) => 'createPart' in n)
                .forEach(addPart.bind(this))
        })
}

/**
 * The main map element. On its own it does not do anything. Has to be combined with layers
 * which are added as [Light DOM](https://developers.google.com/web/fundamentals/web-components/shadowdom#lightdom)
 * children
 *
 * ```html
 * <ol-map>
 *     <ol-layer-openstreetmap></ol-layer-openstreetmap>
 * </ol-map>
 * ```
 *
 * ### Controlling zoom level
 *
 * The simpler way to set zoom is to set the `zoom` property. Alternatively, `resoltution` can be used instead.
 *
 * It is important to note that the two properties are mutually exclusive. `zoom` is ignored when `resolution` is set.
 * This is actually a design of OpenLayers as described
 * [here](https://openlayers.org/en/latest/doc/tutorials/concepts.html)
 *
 * ### Setting initial coordinates
 *
 * The position of the map can also be controlled in two ways:
 *
 * 1. with `x`/`y` coordinates
 * 1. with latitude and longitude
 *
 * If `x` and `y` are set, the geographic coordinates are ignored.
 *
 * @demo demo/ol-map.html
 * @customElement
 */
export default class OlMap extends LitElement {
    /**
     * Zoom level
     * @type {Number}
     */
    @property({ type: Number })
    public zoom: number = 1

    /**
     * Longitude
     * @type {Number}
     */
    @property({ type: Number })
    public lon: number = 0

    /**
     * Latitude
     * @type {Number}
     */
    @property({ type: Number })
    public lat: number = 0

    @query('div')
    public mapElement: HTMLDivElement

    /**
     * A string identifier of the projection to be used. Custom projections can be added using [`proj4` library][p4].
     *
     * If falsy, the default projection is applied (Spherical Mercator aka EPSG:3857), which uses meters for map units.
     *
     * [p4]: https://github.com/proj4js/proj4js
     *
     * @type {string}
     */
    @property({ type: String })
    public projection: string = undefined

    /**
     * Sets the zoom level by directly selecting the resolution.
     *
     * @type {number}
     */
    @property({ type: Number })
    public resolution: number = undefined

    /**
     * The X coordinate on the map in map units (see `projection`).
     *
     * @type {number}
     */
    @property({ type: Number })
    public x: number = null

    /**
     * The Y coordinate on the map in map units (see `projection`).
     *
     * @type {number}
     */
    @property({ type: Number })
    public y: number = null

    /**
     * The underlying OpenLayers map instance
     * @type {Object}
     */
    public map: OpenLayersMap = null

    public parts: Map<Node, any> = new Map<OlLayerBase<Base>, Base>()
    public partObserver: MutationObserver
    public sizeObserver: ResizeObserver

    constructor() {
        super()
        this.partObserver = new MutationObserver(updateParts.bind(this))
        this.sizeObserver = new ResizeObserver(() => {
            if (this.map) {
                this.map.updateSize()
            }
        })
    }

    public connectedCallback() {
        super.connectedCallback()
        this.partObserver.observe(this, { childList: true })
        this.sizeObserver.observe(this)
    }

    public disconnectedCallback() {
        super.disconnectedCallback()
        this.partObserver.disconnect()
        this.sizeObserver.disconnect()
    }

    public firstUpdated() {
        const viewInit = {
            center: [0, 0],
            resolution: this.resolution,
            zoom: this.zoom,
        } as any

        if (this.lon && this.lat) {
            if (this.projection) {
                viewInit.center = fromLonLat([this.lon, this.lat], this.projection)
            } else {
                viewInit.center = fromLonLat([this.lon, this.lat])
            }
        }

        if (this.x && this.y) {
            viewInit.center = [this.x, this.y]
        }

        if (this.projection) {
            viewInit.projection = getProjection(this.projection)
        }
        this.map = new OpenLayersMap({
            target: this.mapElement,
            view: new View(viewInit),
        })

        const children = [...this.querySelectorAll('*')]

        children
            .filter((n) => 'createPart' in n)
            .forEach(addPart.bind(this))
    }

    public render() {
        return html`
<link rel="stylesheet" href="https://openlayers.org/en/v5.3.0/css/ol.css" type="text/css">
<style>
  :host { display: block; }
</style>
<div id="map"></div>`
    }
}

customElements.define('ol-map', OlMap)
