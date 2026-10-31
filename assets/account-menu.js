// Account menu for universecourier.com: a person icon (top right) that opens a small menu.
// Signed in on my.universecourier.com: shows the email, Account and Log out. Otherwise: Account and Sign in.
// The page asks the portal who is signed in (GET /api/session). The site and the portal share universecourier.com,
// so the browser includes the portal's sign-in cookie; the portal only lets universecourier.com read the answer.
(function () {
  "use strict";
  var PORTAL = "https://my.universecourier.com";
  var host = document.getElementById("accountMenu");
  if (!host) return;

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
