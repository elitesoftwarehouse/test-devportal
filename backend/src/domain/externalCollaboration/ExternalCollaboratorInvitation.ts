import { v4 as uuidv4 } from 'uuid';

export type ExternalCollaboratorInvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED';

export interface ExternalCollaboratorInvitationProps {
  id?: string;
  email: string;
  token?: string;
  expiresAt?: Date;
  status?: ExternalCollaboratorInvitationStatus;
  externalOwnerCompanyId: string;
  createdAt?: Date;
  acceptedAt?: Date | null;
}

export class ExternalCollaboratorInvitation {
  public readonly id: string;
  public readonly email: string;
  public readonly externalOwnerCompanyId: string;
  public readonly createdAt: Date;
  private _token: string;
  private _expiresAt: Date;
  private _status: ExternalCollaboratorInvitationStatus;
  private _acceptedAt: Date | null;

  private constructor(props: ExternalCollaboratorInvitationProps) {
    this.id = props.id ?? uuidv4();
    this.email = props.email.toLowerCase();
    this.externalOwnerCompanyId = props.externalOwnerCompanyId;
    this._token = props.token ?? ExternalCollaboratorInvitation.generateToken();
    this._expiresAt = props.expiresAt ?? ExternalCollaboratorInvitation.calculateExpiry();
    this._status = props.status ?? 'PENDING';
    this.createdAt = props.createdAt ?? new Date();
    this._acceptedAt = props.acceptedAt ?? null;
  }

  static createNew(email: string, externalOwnerCompanyId: string): ExternalCollaboratorInvitation {
    return new ExternalCollaboratorInvitation({ email, externalOwnerCompanyId });
  }

  static rehydrate(props: ExternalCollaboratorInvitationProps): ExternalCollaboratorInvitation {
    return new ExternalCollaboratorInvitation(props);
  }

  static generateToken(): string {
    return uuidv4();
  }

  static calculateExpiry(now: Date = new Date()): Date {
    const expires = new Date(now.getTime());
    expires.setDate(expires.getDate() + 7);
    return expires;
  }

  get token(): string {
    return this._token;
  }

  get expiresAt(): Date {
    return this._expiresAt;
  }

  get status(): ExternalCollaboratorInvitationStatus {
    return this._status;
  }

  get acceptedAt(): Date | null {
    return this._acceptedAt;
  }

  isExpired(referenceDate: Date = new Date()): boolean {
    return referenceDate > this._expiresAt;
  }

  accept(referenceDate: Date = new Date()): void {
    if (this._status === 'ACCEPTED') {
      return;
    }
    if (this.isExpired(referenceDate)) {
      this._status = 'EXPIRED';
      return;
    }
    this._status = 'ACCEPTED';
    this._acceptedAt = referenceDate;
  }

  expire(): void {
    if (this._status === 'ACCEPTED') {
      return;
    }
    this._status = 'EXPIRED';
  }

  toPrimitives() {
    return {
      id: this.id,
      email: this.email,
      token: this._token,
      expiresAt: this._expiresAt,
      status: this._status,
      externalOwnerCompanyId: this.externalOwnerCompanyId,
      createdAt: this.createdAt,
      acceptedAt: this._acceptedAt,
    };
  }
}

export type ExternalCollaboratorRole = 'EXTERNAL_COLLABORATOR';
