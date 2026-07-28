// Redirect Mintlify's default hosts to the custom domain.
//
// Mintlify keeps decdn.mintlify.app and decdn.mintlify.site publicly served
// alongside docs.decdn.org with no server-side redirect and no opt-out
// (mintlify/discussions#4753). Every page already emits the correct
// `rel="canonical"` on all three hosts, but Google ignored it and picked the
// .mintlify.app copy as canonical, so it — not docs.decdn.org — is what shows
// up in search. A client-side redirect is the strongest substitute for the 301
// we cannot get: Googlebot renders it, and it gets human visitors arriving from
// today's search results onto the right host.
//
// Mintlify includes any `.js` file in the content directory on every page, so
// this file needs no reference from docs.json.
//
// The duplicate hosts are an explicit allowlist rather than a
// `!== "docs.decdn.org"` check: the inverted form would fire on Mintlify
// preview deployments (and on localhost during `mintlify dev`), breaking
// review of unpublished changes and risking a redirect loop if the custom
// domain ever resolves under another name.
(function () {
  var DUPLICATE_HOSTS = ["decdn.mintlify.app", "decdn.mintlify.site"];

  if (DUPLICATE_HOSTS.indexOf(window.location.hostname) === -1) return;

  // Path, query and hash carry over so a deep link survives the hop.
  var target =
    "https://docs.decdn.org" +
    window.location.pathname +
    window.location.search +
    window.location.hash;

  // `replace`, not `href`, so the duplicate host leaves no history entry for
  // the Back button to land on.
  window.location.replace(target);
})();
