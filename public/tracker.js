;(function () {
  "use strict"

  function getParam(name) {
    try {
      return new URL(window.location.href).searchParams.get(name)
    } catch {
      return null
    }
  }

  function appendXcod(url, xcod) {
    if (!xcod) return url
    try {
      var u = new URL(url)
      if (!u.searchParams.has("xcod")) {
        u.searchParams.set("xcod", xcod)
      }
      return u.toString()
    } catch {
      var sep = url.indexOf("?") === -1 ? "?" : "&"
      return url + sep + "xcod=" + encodeURIComponent(xcod)
    }
  }

  function isHotmartUrl(url) {
    return (
      /pay\.hotmart\.com/i.test(url) ||
      /hotmart\.com\/checkout/i.test(url) ||
      /hotmart\.com\/pay/i.test(url)
    )
  }

  var xcod =
    getParam("splitly_vid") ||
    getParam("xcod") ||
    sessionStorage.getItem("spl_vid")

  if (xcod) {
    sessionStorage.setItem("spl_vid", xcod)

    function processAll() {
      var links = document.querySelectorAll("a[href]")
      for (var i = 0; i < links.length; i++) {
        var a = links[i]
        if (isHotmartUrl(a.href)) {
          a.href = appendXcod(a.href, xcod)
        }
      }

      var buttons = document.querySelectorAll("button, [data-checkout], [data-hotmart]")
      for (var j = 0; j < buttons.length; j++) {
        var btn = buttons[j]
        var checkoutUrl =
          btn.getAttribute("data-checkout") || btn.getAttribute("data-hotmart")
        if (checkoutUrl && isHotmartUrl(checkoutUrl)) {
          btn.setAttribute("data-checkout", appendXcod(checkoutUrl, xcod))
          btn.setAttribute("data-hotmart", appendXcod(checkoutUrl, xcod))
        }
      }
    }

    processAll()

    if (window.MutationObserver) {
      new MutationObserver(processAll).observe(document.documentElement, {
        childList: true,
        subtree: true,
      })
    }
  }
})()
