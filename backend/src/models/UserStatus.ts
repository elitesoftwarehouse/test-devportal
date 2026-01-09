export enum UserStatus {
  PENDING_ACTIVATION = "PENDING_ACTIVATION",
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
  DISABLED = "DISABLED"
}

export const isActiveStatus = (status: UserStatus | string | null | undefined): boolean => {
  if (!status) return false;
  return status === UserStatus.ACTIVE;
};
