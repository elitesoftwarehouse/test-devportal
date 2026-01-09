"use strict";

(function () {
    var form = document.getElementById("external-registration-form");
    if (!form) {
        return;
    }

    var alertPlaceholder = document.getElementById("alert-placeholder");
    var submitBtn = document.getElementById("submit-btn");
    var submitText = document.getElementById("submit-text");
    var submitSpinner = document.getElementById("submit-spinner");

    function showAlert(message, type) {
        alertPlaceholder.innerHTML = "";
        var div = document.createElement("div");
        div.className = "alert alert-" + type + " alert-dismissible fade show";
        div.setAttribute("role", "alert");
        div.textContent = message;
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-close";
        btn.setAttribute("data-bs-dismiss", "alert");
        btn.setAttribute("aria-label", "Close");
        div.appendChild(btn);
        alertPlaceholder.appendChild(div);
    }

    function setLoading(isLoading) {
        if (!submitBtn || !submitText || !submitSpinner) {
            return;
        }
        submitBtn.disabled = isLoading;
        if (isLoading) {
            submitSpinner.classList.remove("d-none");
            submitText.textContent = "Registrazione in corso...";
        } else {
            submitSpinner.classList.add("d-none");
            submitText.textContent = "Registrati";
        }
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();
        alertPlaceholder.innerHTML = "";

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        var payload = {
            firstName: document.getElementById("firstName").value.trim(),
            lastName: document.getElementById("lastName").value.trim(),
            email: document.getElementById("email").value.trim(),
            password: document.getElementById("password").value,
            role: document.getElementById("role").value,
            privacyAccepted: document.getElementById("privacyAccepted").checked,
            termsAccepted: document.getElementById("termsAccepted").checked
        };

        if (!payload.role) {
            showAlert("Seleziona un ruolo.", "warning");
            return;
        }

        setLoading(true);

        fetch("/api/public/register/external", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })
            .then(function (response) {
                return response.json().then(function (data) {
                    return { status: response.status, body: data };
                });
            })
            .then(function (result) {
                if (result.body && result.body.success) {
                    showAlert(result.body.message || "Registrazione completata.", "success");
                    form.reset();
                } else {
                    var msg = (result.body && result.body.message) || "Errore durante la registrazione.";
                    showAlert(msg, "danger");
                }
            })
            .catch(function () {
                showAlert("Errore di comunicazione con il server.", "danger");
            })
            .finally(function () {
                setLoading(false);
            });
    });
})();
