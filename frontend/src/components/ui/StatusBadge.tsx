import React from 'react';
import Badge, { BadgeVariant } from './Badge';

// Mapping degli stati alle varianti e label
const STATUS_CONFIG: Record<string, { variant: BadgeVariant; label: string }> = {
  // Accreditation statuses
  DRAFT: { variant: 'default', label: 'Bozza' },
  SUBMITTED: { variant: 'warning', label: 'In Attesa' },
  UNDER_REVIEW: { variant: 'info', label: 'In Revisione' },
  APPROVED: { variant: 'success', label: 'Approvato' },
  REJECTED: { variant: 'danger', label: 'Rifiutato' },
  
  // Order statuses (OdL)
  CREATED: { variant: 'default', label: 'Creato' },
  SENT: { variant: 'info', label: 'Inviato' },
  ACKNOWLEDGED: { variant: 'primary', label: 'Preso in Carico' },
  IN_PROGRESS: { variant: 'warning', label: 'In Corso' },
  DONE: { variant: 'success', label: 'Completato' },
  ARCHIVED: { variant: 'default', label: 'Archiviato' },
  
  // Invoice statuses
  UPLOADED: { variant: 'info', label: 'Caricata' },
  UNDER_CHECK: { variant: 'warning', label: 'In Verifica' },
  ACCEPTED: { variant: 'success', label: 'Accettata' },
  
  // Generic
  ACTIVE: { variant: 'success', label: 'Attivo' },
  INACTIVE: { variant: 'default', label: 'Inattivo' },
  PENDING: { variant: 'warning', label: 'In Attesa' },
};

export interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className }) => {
  const config = STATUS_CONFIG[status] || { variant: 'default' as BadgeVariant, label: status };
  
  return (
    <Badge variant={config.variant} className={className}>
      {config.label}
    </Badge>
  );
};

export default StatusBadge;

