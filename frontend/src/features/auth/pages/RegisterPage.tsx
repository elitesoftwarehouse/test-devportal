import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Card } from '../../../components/ui';
import styles from './RegisterPage.module.css';

type AccountType = 'professional' | 'company';

export const RegisterPage: React.FC = () => {
  const { register, loading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'type' | 'form'>('type');
  const [accountType, setAccountType] = useState<AccountType>('professional');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    companyName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleTypeSelect = (type: AccountType) => {
    setAccountType(type);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    if (formData.password.length < 8) {
      setError('La password deve essere di almeno 8 caratteri');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        type: accountType,
        name: formData.name,
        companyName: accountType === 'company' ? formData.companyName : undefined,
      });
      setSuccess(true);
    } catch (err) {
      setError('Errore durante la registrazione. Riprova.');
    }
  };

  if (success) {
    return (
      <div className={styles.container}>
        <Card padding="lg" className={styles.successCard}>
          <div className={styles.successIcon}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22,4 12,14.01 9,11.01" />
            </svg>
          </div>
          <h2>Registrazione completata!</h2>
          <p>
            Ti abbiamo inviato un'email di conferma. Controlla la tua casella di posta e clicca sul link per attivare il tuo account.
          </p>
          <Button onClick={() => navigate('/login')}>Vai al Login</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Registrati</h1>
        <p className={styles.subtitle}>
          {step === 'type'
            ? 'Scegli il tipo di account'
            : accountType === 'professional'
            ? 'Completa la registrazione come Professionista'
            : 'Completa la registrazione come Azienda'}
        </p>
      </div>

      {step === 'type' ? (
        <div className={styles.typeSelection}>
          <button
            className={styles.typeCard}
            onClick={() => handleTypeSelect('professional')}
          >
            <div className={styles.typeIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <h3>Professionista</h3>
            <p>Libero professionista che opera singolarmente</p>
          </button>

          <button
            className={styles.typeCard}
            onClick={() => handleTypeSelect('company')}
          >
            <div className={styles.typeIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 21h18M3 7v1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7m0 1a3 3 0 0 0 6 0V7H3l2-4h14l2 4M5 21V10.85M19 21V10.85M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
              </svg>
            </div>
            <h3>Azienda</h3>
            <p>Società fornitrice con uno o più collaboratori</p>
          </button>
        </div>
      ) : (
        <Card padding="lg" className={styles.card}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {error && (
              <div className={styles.error}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {accountType === 'company' && (
              <Input
                label="Ragione Sociale"
                placeholder="Nome Azienda Srl"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
              />
            )}

            <Input
              label={accountType === 'professional' ? 'Nome e Cognome' : 'Nome Referente'}
              placeholder="Mario Rossi"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Email"
              type="email"
              placeholder="nome@esempio.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Minimo 8 caratteri"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <Input
              label="Conferma Password"
              type="password"
              placeholder="Ripeti la password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />

            <div className={styles.actions}>
              <Button variant="outline" type="button" onClick={() => setStep('type')}>
                Indietro
              </Button>
              <Button type="submit" isLoading={loading}>
                Registrati
              </Button>
            </div>
          </form>
        </Card>
      )}

      <p className={styles.loginLink}>
        Hai già un account?{' '}
        <Link to="/login">Accedi</Link>
      </p>
    </div>
  );
};

export default RegisterPage;

