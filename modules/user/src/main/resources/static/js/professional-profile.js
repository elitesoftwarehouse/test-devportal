document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("professional-profile-form");
  var alertBox = document.getElementById("profile-alert");

  function showAlert(type, message) {
    alertBox.className = "alert alert-" + type;
    alertBox.textContent = message;
    alertBox.classList.remove("d-none");
  }

  function hideAlert() {
    alertBox.classList.add("d-none");
  }

  function getCurrentUserId() {
    var meta = document.querySelector('meta[name="current-user-id"]');
    if (meta && meta.content) {
      return parseInt(meta.content, 10);
    }
    return null;
  }

  if (!form) {
    return;
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    hideAlert();

    if (!form.checkValidity()) {
      form.classList.add("was-validated");
      showAlert("danger", "Compila tutti i campi obbligatori.");
      return;
    }

    var userId = getCurrentUserId();
    if (!userId) {
      showAlert("danger", "Utente non identificato. Effettua nuovamente il login.");
      return;
    }

    var payload = {
      firstName: form.firstName.value.trim(),
      lastName: form.lastName.value.trim(),
      dateOfBirth: form.dateOfBirth.value || null,
      placeOfBirth: form.placeOfBirth.value.trim() || null,
      fiscalCode: form.fiscalCode.value.trim(),
      nationality: form.nationality.value.trim() || null,
      gender: form.gender.value || null,
      primaryEmail: form.primaryEmail.value.trim(),
      secondaryEmail: form.secondaryEmail.value.trim() || null,
      mobilePhone: form.mobilePhone.value.trim(),
      landlinePhone: form.landlinePhone.value.trim() || null,
      vatNumber: form.vatNumber.value.trim() || null,
      taxRegime: form.taxRegime.value.trim(),
      pecEmail: form.pecEmail.value.trim(),
      sdiCode: form.sdiCode.value.trim() || null,
      residenceAddress: form.residenceAddress.value.trim(),
      residenceCity: form.residenceCity.value.trim(),
      residenceZip: form.residenceZip.value.trim(),
      residenceProvince: form.residenceProvince.value.trim(),
      residenceCountry: form.residenceCountry.value.trim(),
      domicileAddress: form.domicileAddress.value.trim() || null,
      domicileCity: form.domicileCity.value.trim() || null,
      domicileZip: form.domicileZip.value.trim() || null,
      domicileProvince: form.domicileProvince.value.trim() || null,
      domicileCountry: form.domicileCountry.value.trim() || null,
      taxAddress: form.taxAddress.value.trim() || null,
      taxCity: form.taxCity.value.trim() || null,
      taxZip: form.taxZip.value.trim() || null,
      taxProvince: form.taxProvince.value.trim() || null,
      taxCountry: form.taxCountry.value.trim() || null
    };

    fetch("/api/professional-profile/user/" + userId, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        if (!response.ok) {
          return response.text().then(function (text) {
            throw new Error(text || "Errore nel salvataggio del profilo.");
          });
        }
        return response.json();
      })
      .then(function () {
        showAlert("success", "Profilo salvato correttamente.");
      })
      .catch(function (error) {
        showAlert("danger", error.message || "Errore imprevisto.");
      });
  });
});
