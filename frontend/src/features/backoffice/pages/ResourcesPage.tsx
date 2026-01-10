import React, { useState } from 'react';
import {
  Card,
  Button,
  Input,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
  Badge,
  StatusBadge,
} from '../../../components/ui';
import styles from './ResourcesPage.module.css';

// Mock data
const mockResources = [
  { id: '1', name: 'Mario Rossi', company: 'Tech Innovators Srl', email: 'mario@techinnovators.it', skills: ['React', 'Node.js', 'PostgreSQL'], status: 'ACTIVE' },
  { id: '2', name: 'Laura Bianchi', company: 'Tech Innovators Srl', email: 'laura@techinnovators.it', skills: ['React', 'TypeScript', 'GraphQL'], status: 'ACTIVE' },
  { id: '3', name: 'Marco Verdi', company: 'Digital Services SpA', email: 'marco@digitalservices.it', skills: ['Java', 'Spring Boot', 'Oracle'], status: 'ACTIVE' },
  { id: '4', name: 'Anna Neri', company: null, email: 'anna.neri@email.com', skills: ['Python', 'Django', 'AWS'], status: 'INACTIVE' },
  { id: '5', name: 'Giuseppe Blu', company: 'Cloud Solutions Srl', email: 'giuseppe@cloudsolutions.it', skills: ['Azure', 'DevOps', 'Kubernetes'], status: 'ACTIVE' },
];

export const ResourcesPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('');

  const filteredResources = mockResources.filter((res) => {
    const matchesSearch =
      !searchQuery ||
      res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (res.company && res.company.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSkill =
      !skillFilter ||
      res.skills.some((s) => s.toLowerCase().includes(skillFilter.toLowerCase()));

    return matchesSearch && matchesSkill;
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Anagrafica Risorse</h1>
          <p className={styles.subtitle}>Cerca e visualizza le risorse esterne accreditate</p>
        </div>
      </div>

      <Card padding="none">
        <div className={styles.toolbar}>
          <Input
            placeholder="Cerca per nome, email o azienda..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            }
          />
          <Input
            placeholder="Filtra per competenza..."
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className={styles.skillInput}
            leftIcon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22,3 2,3 10,12.46 10,19 14,21 14,12.46" />
              </svg>
            }
          />
        </div>

        <Table>
          <TableHeader>
            <TableRow hover={false}>
              <TableHead>Risorsa</TableHead>
              <TableHead>Azienda</TableHead>
              <TableHead>Competenze</TableHead>
              <TableHead>Stato</TableHead>
              <TableHead align="right">Azioni</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResources.length === 0 ? (
              <TableEmpty message="Nessuna risorsa trovata" colSpan={5} />
            ) : (
              filteredResources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>
                    <div className={styles.resourceInfo}>
                      <div className={styles.avatar}>
                        {resource.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <div>
                        <span className={styles.name}>{resource.name}</span>
                        <span className={styles.email}>{resource.email}</span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {resource.company || <span className={styles.noCompany}>Professionista</span>}
                  </TableCell>
                  <TableCell>
                    <div className={styles.skills}>
                      {resource.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="default" size="sm">
                          {skill}
                        </Badge>
                      ))}
                      {resource.skills.length > 3 && (
                        <Badge variant="default" size="sm">+{resource.skills.length - 3}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={resource.status} />
                  </TableCell>
                  <TableCell align="right">
                    <Button variant="ghost" size="sm">
                      Visualizza CV
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className={styles.tableFooter}>
          <span className={styles.resultCount}>
            Trovate {filteredResources.length} risorse
          </span>
        </div>
      </Card>
    </div>
  );
};

export default ResourcesPage;

