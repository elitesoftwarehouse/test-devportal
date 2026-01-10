import React, { useState } from 'react';
import { useAuth } from '../../auth/context/AuthContext';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Tabs,
  TabsList,
  Tab,
  TabsContent,
  Badge,
} from '../../../components/ui';
import styles from './ProfilePage.module.css';

// Mock data
const mockProfile = {
  name: 'Mario Rossi',
  email: 'mario.rossi@email.com',
  phone: '+39 333 1234567',
  piva: '12345678901',
  fiscalCode: 'RSSMRA80A01H501Z',
  address: 'Via Roma 123, 00100 Roma',
  skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
  cvFileName: 'CV_Mario_Rossi_2026.pdf',
  cvUploadDate: '05/01/2026',
};

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(mockProfile);

  const handleSave = () => {
    // In produzione: chiamata API
    setIsEditing(false);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Il Mio Profilo</h1>
          <p className={styles.subtitle}>Gestisci le tue informazioni personali e professionali</p>
        </div>
      </div>

      <Tabs defaultValue="info">
        <TabsList>
          <Tab value="info">Informazioni</Tab>
          <Tab value="cv">CV e Competenze</Tab>
          <Tab value="documents">Documenti</Tab>
        </TabsList>

        {/* Tab Informazioni */}
        <TabsContent value="info">
          <Card>
            <CardHeader
              action={
                !isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Modifica
                  </Button>
                ) : null
              }
            >
              <CardTitle>Dati Anagrafici</CardTitle>
              <CardDescription>Informazioni personali e di contatto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.formGrid}>
                <Input
                  label="Nome e Cognome"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={!isEditing}
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  disabled
                  hint="L'email non può essere modificata"
                />
                <Input
                  label="Telefono"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  disabled={!isEditing}
                />
                <Input
                  label="Partita IVA"
                  value={formData.piva}
                  onChange={(e) => setFormData({ ...formData, piva: e.target.value })}
                  disabled={!isEditing}
                />
                <Input
                  label="Codice Fiscale"
                  value={formData.fiscalCode}
                  onChange={(e) => setFormData({ ...formData, fiscalCode: e.target.value })}
                  disabled={!isEditing}
                />
                <Input
                  label="Indirizzo"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  disabled={!isEditing}
                  className={styles.fullWidth}
                />
              </div>
            </CardContent>
            {isEditing && (
              <CardFooter>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Annulla
                </Button>
                <Button onClick={handleSave}>Salva Modifiche</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Tab CV e Competenze */}
        <TabsContent value="cv">
          <div className={styles.cvGrid}>
            {/* CV Upload */}
            <Card>
              <CardHeader>
                <CardTitle>Curriculum Vitae</CardTitle>
                <CardDescription>Carica il tuo CV in formato PDF o DOCX</CardDescription>
              </CardHeader>
              <CardContent>
                {mockProfile.cvFileName ? (
                  <div className={styles.cvInfo}>
                    <div className={styles.cvFile}>
                      <div className={styles.cvIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14,2 14,8 20,8" />
                        </svg>
                      </div>
                      <div className={styles.cvDetails}>
                        <span className={styles.cvName}>{mockProfile.cvFileName}</span>
                        <span className={styles.cvDate}>Caricato il {mockProfile.cvUploadDate}</span>
                      </div>
                    </div>
                    <div className={styles.cvActions}>
                      <Button variant="ghost" size="sm">
                        Scarica
                      </Button>
                      <Button variant="outline" size="sm">
                        Sostituisci
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.uploadArea}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17,8 12,3 7,8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <p>Trascina qui il tuo CV o clicca per selezionarlo</p>
                    <Button variant="outline">Seleziona File</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Skills */}
            <Card>
              <CardHeader>
                <CardTitle>Competenze</CardTitle>
                <CardDescription>Le tue skill professionali</CardDescription>
              </CardHeader>
              <CardContent>
                <div className={styles.skills}>
                  {mockProfile.skills.map((skill) => (
                    <Badge key={skill} variant="primary">
                      {skill}
                    </Badge>
                  ))}
                </div>
                <Button variant="outline" className={styles.addSkillBtn}>
                  + Aggiungi Competenza
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab Documenti */}
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Documenti</CardTitle>
              <CardDescription>Documenti aggiuntivi per l'accreditamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.documentsList}>
                <div className={styles.documentItem}>
                  <div className={styles.documentInfo}>
                    <div className={styles.documentIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="16" rx="2" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div>
                      <span className={styles.documentName}>Documento d'Identità</span>
                      <span className={styles.documentStatus}>Non caricato</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Carica</Button>
                </div>

                <div className={styles.documentItem}>
                  <div className={styles.documentInfo}>
                    <div className={styles.documentIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                      </svg>
                    </div>
                    <div>
                      <span className={styles.documentName}>Visura Camerale</span>
                      <span className={styles.documentStatus}>Opzionale</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Carica</Button>
                </div>

                <div className={styles.documentItem}>
                  <div className={styles.documentInfo}>
                    <div className={styles.documentIcon}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                    </div>
                    <div>
                      <span className={styles.documentName}>NDA Firmato</span>
                      <span className={styles.documentStatus}>Opzionale</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">Carica</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfilePage;

