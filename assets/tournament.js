// Tournament registration: save the form to the club's Google Sheet, then open
// the checkout for the chosen event(s). Fill in the settings below to go live.
var REGISTRATION = {
  // The Google Apps Script web app URL that writes rows to the registration
  // sheet (see tools/registration-sheet.gs). Ends in /exec.
  sheetEndpoint: "https://script.google.com/macros/s/AKfycbz9sK3Abp7dQOtWuOPS4DU4x_YsDIGQUomk-oqHXcBR7dILbvkofyvnhwadKjyH6kM/exec",
  // The early-registration note (code EARLYBIRD in Stripe, $10 off) is shown
  // until the end of December 16, 2026, Cape Girardeau time.
  earlyUntil: "2026-12-17T00:00:00-06:00",
  // Checkout links (Stripe Payment Links, regular prices) for each choice.
  paymentLinks: {
    "beginners-synthetic": "https://buy.stripe.com/9B614m73a6TZ9375vu93y00",  // $40
    "steel-open": "https://buy.stripe.com/28EfZg2MU1zF5QV4rq93y01",           // $55
    "both": "https://buy.stripe.com/6oUaEWevC3HN7Z34rq93y02"                  // $75
  }
};

(function () {
  var form = document.getElementById("register-form");
  if (!form) return;
  var status = document.getElementById("register-status");
  var button = document.getElementById("register-submit");
  var ageGroup = document.getElementById("r-minor");
  var guardianField = document.getElementById("guardian-field");
  var guardian = document.getElementById("r-guardian");

  ageGroup.addEventListener("change", function () {
    var minor = ageGroup.value === "minor";
    guardianField.hidden = !minor;
    guardian.required = minor;
  });

  function say(text, isError) {
    status.textContent = text;
    status.classList.toggle("form-error", !!isError);
    status.hidden = false;
  }

  // Until every setting above is filled in, show that registration isn't open.
  function isOpen() {
    var links = REGISTRATION.paymentLinks;
    return !!REGISTRATION.sheetEndpoint && ["beginners-synthetic", "steel-open", "both"].every(function (key) {
      return !!links[key];
    });
  }
  if (!isOpen()) {
    button.disabled = true;
    button.textContent = "Registration opens soon";
    say("Registration isn't open yet. Check back soon, or email capegirardeauhema@gmail.com with questions.");
  }

  var earlyNote = document.getElementById("early-note");
  if (earlyNote) earlyNote.hidden = new Date() >= new Date(REGISTRATION.earlyUntil);

  function chosenEvents() {
    return Array.prototype.slice.call(form.querySelectorAll('input[name="events"]:checked'))
      .map(function (box) { return box.value; });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var events = chosenEvents();
    if (!events.length) { say("Choose at least one event.", true); return; }
    if (!form.checkValidity()) { form.reportValidity(); say("Fill in the highlighted fields.", true); return; }

    var key = events.length === 2 ? "both" : events[0];
    var payUrl = REGISTRATION.paymentLinks[key];
    if (!isOpen()) {
      say("Registration isn't open yet. Check back soon, or email capegirardeauhema@gmail.com.", true);
      return;
    }

    // One ID ties the registration to its payment in the checkout records.
    var regId = "CGH-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    var data = new URLSearchParams(new FormData(form));
    data.delete("events");
    data.append("events", events.join(", "));
    data.append("registration_id", regId);

    button.disabled = true;
    say("Saving your registration…");
    // Google Apps Script doesn't send CORS headers, so the response can't be
    // read; a network error is the only failure the page can see.
    fetch(REGISTRATION.sheetEndpoint, { method: "POST", mode: "no-cors", body: data })
      .then(function () {
        say("Saved. Taking you to payment…");
        var url = payUrl + (payUrl.indexOf("?") < 0 ? "?" : "&") +
          "prefilled_email=" + encodeURIComponent(data.get("email")) +
          "&client_reference_id=" + encodeURIComponent(regId);
        window.location.href = url;
      })
      .catch(function () {
        button.disabled = false;
        say("Your registration didn't go through. Try again, or email capegirardeauhema@gmail.com.", true);
      });
  });
})();
