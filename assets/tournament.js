// Tournament registration: send the form to the form service, then open the
// checkout for the chosen event(s). Fill in the three settings below to go live.
var REGISTRATION = {
  // Where registrations are sent (a Formspree form endpoint).
  formEndpoint: "",
  // Checkout links (Stripe Payment Links) for each combination of events.
  paymentLinks: {
    "beginners-synthetic": "",
    "steel-open": "",
    "both": ""
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
    if (!REGISTRATION.formEndpoint || !payUrl) {
      say("Registration isn't open yet. Check back soon, or email capegirardeauhema@gmail.com.", true);
      return;
    }

    // One ID ties the registration to its payment in the checkout records.
    var regId = "CGH-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    var data = new FormData(form);
    data.delete("events");
    data.append("events", events.join(", "));
    data.append("registration_id", regId);

    button.disabled = true;
    say("Saving your registration…");
    fetch(REGISTRATION.formEndpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
      .then(function (res) {
        if (!res.ok) throw new Error("status " + res.status);
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
