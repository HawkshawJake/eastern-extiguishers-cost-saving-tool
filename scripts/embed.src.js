/*
 * Eastern Extinguishers — Cost Savings Calculator embed loader.
 *
 *   <div id="eastern-calculator"></div>
 *   <script src="https://YOUR-APP-DOMAIN/embed.js" async></script>
 *
 * Drops the calculator into #eastern-calculator (or wherever the script tag
 * sits, if that element is missing) and keeps the frame's height in step with
 * its content. Optional attributes on the script tag:
 *
 *   data-target="#my-container"   mount somewhere else
 *   data-heading="0"              hide the calculator's own title block
 */
(function () {
  'use strict'

  var HEIGHT_MESSAGE = 'eastern-calculator:height'
  var SCROLL_MESSAGE = 'eastern-calculator:scroll'
  var VIEWPORT_MESSAGE = 'eastern-calculator:viewport'
  var DEFAULT_TARGET_ID = 'eastern-calculator'
  var MIN_HEIGHT = 520

  function currentScript() {
    if (document.currentScript) return document.currentScript
    var scripts = document.getElementsByTagName('script')
    for (var i = scripts.length - 1; i >= 0; i--) {
      if ((scripts[i].src || '').indexOf('/embed.js') !== -1) return scripts[i]
    }
    return null
  }

  var script = currentScript()
  if (!script || script.getAttribute('data-ee-loaded') === '1') return
  script.setAttribute('data-ee-loaded', '1')

  var origin
  try {
    origin = new URL(script.src, window.location.href).origin
  } catch (e) {
    return
  }

  function mountPoint() {
    var selector = script.getAttribute('data-target')
    if (selector) {
      var chosen = document.querySelector(selector)
      if (chosen) return chosen
    }
    var byId = document.getElementById(DEFAULT_TARGET_ID)
    if (byId) return byId
    var fallback = document.createElement('div')
    fallback.id = DEFAULT_TARGET_ID
    var parent = script.parentNode
    if (parent && parent.nodeName !== 'HEAD') parent.insertBefore(fallback, script)
    else document.body.appendChild(fallback)
    return fallback
  }

  function build() {
    var container = mountPoint()
    if (container.getAttribute('data-ee-mounted') === '1') return
    container.setAttribute('data-ee-mounted', '1')

    var src = origin + '/embed'
    if (script.getAttribute('data-heading') === '0') src += '?heading=0'

    var frame = document.createElement('iframe')
    frame.src = src
    frame.title = 'Eastern Extinguishers cost savings calculator'
    frame.loading = 'lazy'
    frame.setAttribute('scrolling', 'no')
    frame.setAttribute('allowtransparency', 'true')
    frame.style.width = '100%'
    frame.style.border = '0'
    frame.style.display = 'block'
    frame.style.overflow = 'hidden'
    frame.style.height = MIN_HEIGHT + 'px'
    container.appendChild(frame)

    // Tell the calculator which slice of itself the visitor can see, so the
    // report form can be centred on screen rather than on the tall frame.
    var pending = false
    function sendViewport() {
      pending = false
      if (!frame.contentWindow) return
      var rect = frame.getBoundingClientRect()
      var visibleTop = Math.max(0, -rect.top)
      var visibleBottom = Math.min(rect.height, window.innerHeight - rect.top)
      frame.contentWindow.postMessage({
        type: VIEWPORT_MESSAGE,
        top: visibleTop,
        height: Math.max(0, visibleBottom - visibleTop),
      }, origin)
    }
    function queueViewport() {
      if (pending) return
      pending = true
      window.requestAnimationFrame(sendViewport)
    }
    window.addEventListener('scroll', queueViewport, { passive: true })
    window.addEventListener('resize', queueViewport)
    frame.addEventListener('load', sendViewport)

    window.addEventListener('message', function (event) {
      if (event.origin !== origin) return
      if (event.source !== frame.contentWindow) return
      var data = event.data
      if (!data || typeof data !== 'object') return

      if (data.type === HEIGHT_MESSAGE) {
        var height = parseInt(data.height, 10)
        if (height > 0) {
          frame.style.height = Math.max(height, MIN_HEIGHT) + 'px'
          queueViewport()
        }
        return
      }

      if (data.type === SCROLL_MESSAGE) {
        var top = frame.getBoundingClientRect().top
        if (top < 0) {
          window.scrollTo({ top: top + window.pageYOffset - 24, behavior: 'smooth' })
        }
        queueViewport()
      }
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build)
  } else {
    build()
  }
})()
