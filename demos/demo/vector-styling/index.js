import loadPolyfills from '@open-wc/polyfills-loader'

loadPolyfills().then(() => {
  import('../../adaptive-demo')
  import('./styled-map')
})
