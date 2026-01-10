import React from 'react';
import PropTypes from 'prop-types';
import './ProfileQualityBadge.css';

export function ProfileQualityBadge({ quality }) {
  const { percentComplete, level } = quality;

  let className = 'profile-quality-badge';
  if (level === 'ALTA') className += ' profile-quality-badge--high';
  if (level === 'MEDIA') className += ' profile-quality-badge--medium';
  if (level === 'BASSA') className += ' profile-quality-badge--low';

  return (
    <span className={className} title={`Completezza: ${percentComplete}%`}>
      {level} ({percentComplete}%)
    </span>
  );
}

ProfileQualityBadge.propTypes = {
  quality: PropTypes.shape({
    percentComplete: PropTypes.number.isRequired,
    level: PropTypes.oneOf(['ALTA', 'MEDIA', 'BASSA']).isRequired,
    missingFields: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
};

export default ProfileQualityBadge;
