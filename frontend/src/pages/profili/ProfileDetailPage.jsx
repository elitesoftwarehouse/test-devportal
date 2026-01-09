import React from "react";
import PropTypes from "prop-types";
import ProfileCompletenessIndicator from "../../components/profile/ProfileCompletenessIndicator";

/**
 * Pagina di dettaglio profilo generica (placeholder) che integra
 * l'indicatore di completezza. In un progetto reale, questo componente
 * verrebbe integrato nelle pagine di dettaglio esistenti.
 */

export function ProfileDetailPage({ profileType, profileId }) {
  return (
    <div className="profile-detail-page">
      <h1>Dettaglio profilo</h1>
      <ProfileCompletenessIndicator profileType={profileType} profileId={profileId} />
      {/* Altri pannelli di dettaglio profilo esistenti qui */}
    </div>
  );
}

ProfileDetailPage.propTypes = {
  profileType: PropTypes.oneOf(["professionista", "azienda", "collaboratore"]).isRequired,
  profileId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default ProfileDetailPage;
