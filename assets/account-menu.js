// Account menu for universecourier.com: a person icon (top right) that opens a small menu.
// Signed in on my.universecourier.com: shows the email, Account and Log out. Otherwise: Account and Sign in.
// The page asks the portal who is signed in (GET /api/session). The site and the portal share universecourier.com,
// so the browser includes the portal's sign-in cookie; the portal only lets universecourier.com read the answer.
(function () {
  "use strict";
  var PORTAL = "https://my.universecourier.com";
  var host = document.getElementById("accountMenu");
  if (!host) return;

  // Styles live here (not in a separate .css file) so the menu can never show up unstyled because one of two
  // files was cached or missing. Colors come from each page's theme variables.
  if (!document.getElementById("accountMenuStyles")) {
    var style = document.createElement("style");
    style.id = "accountMenuStyles";
    style.textContent =
      ".header-tools { display: flex; align-items: center; gap: 8px; }\n" +
      ".account-menu { position: relative; }\n" +
      ".account-btn { display: inline-flex; align-items: center; justify-content: center; width: 34px; height: 32px; padding: 0;\n" +
      "  border: 1px solid var(--border); border-radius: 8px; background: var(--surface-1); color: var(--text-secondary); cursor: pointer; }\n" +
      ".account-btn:hover, .account-btn[aria-expanded=\"true\"] { color: var(--text-primary); border-color: var(--text-muted); }\n" +
      ".account-btn:focus-visible, .account-panel a:focus-visible, .account-panel button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }\n" +
      ".account-btn.signed-in { color: var(--accent); }\n" +
      ".account-panel { position: absolute; right: 0; top: calc(100% + 8px); z-index: 30; min-width: 220px; max-width: min(300px, calc(100vw - 32px));\n" +
      "  background: var(--surface-1); border: 1px solid var(--border); border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,.18); padding: 6px; }\n" +
      ".account-panel[hidden] { display: none; }\n" +
      ".account-panel .account-who { color: var(--text-muted); font-size: 13px; padding: 8px 10px; overflow-wrap: anywhere; }\n" +
      ".account-panel hr { border: 0; border-top: 1px solid var(--border); margin: 4px 2px; }\n" +
      ".account-panel a, .account-panel button { display: block; width: 100%; text-align: left; padding: 8px 10px; border: 0; border-radius: 6px; background: none;\n" +
      "  color: var(--text-primary); font: 14px Inter, system-ui, sans-serif; text-decoration: none; cursor: pointer; }\n" +
      ".account-panel a:hover, .account-panel button:hover { background: var(--grid); }\n" +
      ".account-panel .account-out { color: var(--critical); }\n" +
      ".account-panel .account-in { color: var(--accent); font-weight: 600; }\n" +
      ".account-panel form { margin: 0; }\n" +
      ".account-panel.align-left { right: auto; left: 0; }\n" +
      "";
    document.head.appendChild(style);
  }

  var personIcon = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
    'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' +
    '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7"/></svg>';

  host.className = "account-menu";
  var button = document.createElement("button");
  button.type = "button";
  button.className = "account-btn";
  button.setAttribute("aria-haspopup", "menu");
  button.setAttribute("aria-expanded", "false");
  button.setAttribute("aria-controls", "accountPanel");
  button.setAttribute("aria-label", "Account");
  button.title = "Account";
  button.innerHTML = personIcon;

  var panel = document.createElement("div");
  panel.className = "account-panel";
  panel.id = "accountPanel";
  panel.setAttribute("role", "menu");
  panel.hidden = true;

  host.appendChild(button);
  host.appendChild(panel);

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }
  function link(text, href, cls) {
    var a = el("a", cls, text);
    a.href = href;
    a.setAttribute("role", "menuitem");
    return a;
  }

  function render(session) {
    panel.replaceChildren();
    var signedIn = !!(session && session.signedIn);
    button.classList.toggle("signed-in", signedIn);
    button.setAttribute("aria-label", signedIn ? "Account: signed in as " + session.email : "Account: not signed in");
    button.title = signedIn ? session.email : "Account";

    panel.appendChild(el("div", "account-who", signedIn ? session.email : "Not signed in"));
    panel.appendChild(el("hr"));
    panel.appendChild(link("Account", PORTAL + "/settings"));
    panel.appendChild(el("hr"));

    if (signedIn && session.signOutToken) {
      // A real form post (with the portal's anti-forgery token), so another site can't sign you out.
      var form = el("form");
      form.method = "post";
      form.action = PORTAL + "/account/logout";
      var token = el("input");
      token.type = "hidden";
      token.name = "__RequestVerificationToken";
      token.value = session.signOutToken;
      var back = el("input");
      back.type = "hidden";
      back.name = "returnUrl";
      back.value = location.href;
      var out = el("button", "account-out", "Log out");
      out.type = "submit";
      out.setAttribute("role", "menuitem");
      form.appendChild(token);
      form.appendChild(back);
      form.appendChild(out);
      panel.appendChild(form);
    } else if (signedIn) {
      panel.appendChild(link("Log out", PORTAL + "/account/logout", "account-out"));
    } else {
      panel.appendChild(link("Sign in", PORTAL + "/account/login", "account-in"));
    }
  }

  function open(show) {
    panel.hidden = !show;
    button.setAttribute("aria-expanded", show ? "true" : "false");
    if (show) {
      // Open toward whichever side has room (on phones the header wraps and the icon can end up on the left).
      panel.classList.remove("align-left");
      if (panel.getBoundingClientRect().left < 8) panel.classList.add("align-left");
      var first = panel.querySelector("a, button");
      if (first) first.focus();
    }
  }
  button.addEventListener("click", function () { open(panel.hidden); });
  document.addEventListener("click", function (e) {
    if (!panel.hidden && !host.contains(e.target)) open(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) { open(false); button.focus(); }
  });

  render(null);
  fetch(PORTAL + "/api/session", { credentials: "include", cache: "no-store" })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(render)
    .catch(function () { /* portal unreachable: stay on "Not signed in" */ });
})();
