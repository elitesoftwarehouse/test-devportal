import express, { Request, Response } from 'express';
import Supplier from '../models/Supplier';
import { getSequelizeInstance } from '../sequelize';

const router = express.Router();

getSequelizeInstance().then((sequelize) => {
  if (!sequelize.models.Supplier) {
    Supplier.initialize(sequelize);
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const suppliers = await Supplier.findAll({
      where: {},
      order: [['ragioneSociale', 'ASC']],
    });
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ message: 'Errore durante il recupero dei fornitori.' });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id as any);
    if (!supplier) {
      return res.status(404).json({ message: 'Fornitore non trovato.' });
    }
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: 'Errore durante il recupero del fornitore.' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const {
      ragioneSociale,
      partitaIva,
      codiceFiscale,
      codiceSdi,
      pec,
      indirizzoVia,
      indirizzoCap,
      indirizzoCitta,
      indirizzoProvincia,
      indirizzoNazione,
      telefono,
      email,
      sitoWeb,
      isActive,
    } = req.body;

    if (!ragioneSociale) {
      return res.status(400).json({ message: 'La ragione sociale è obbligatoria.' });
    }

    const supplier = await Supplier.create({
      ragioneSociale,
      partitaIva: partitaIva || null,
      codiceFiscale: codiceFiscale || null,
      codiceSdi: codiceSdi || null,
      pec: pec || null,
      indirizzoVia: indirizzoVia || null,
      indirizzoCap: indirizzoCap || null,
      indirizzoCitta: indirizzoCitta || null,
      indirizzoProvincia: indirizzoProvincia || null,
      indirizzoNazione: indirizzoNazione || null,
      telefono: telefono || null,
      email: email || null,
      sitoWeb: sitoWeb || null,
      isActive: typeof isActive === 'boolean' ? isActive : true,
      updatedByUserId: (req as any).user?.id || null,
    });

    res.status(201).json(supplier);
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Partita IVA già presente per un altro fornitore.' });
    }
    res.status(500).json({ message: 'Errore durante la creazione del fornitore.' });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id as any);
    if (!supplier) {
      return res.status(404).json({ message: 'Fornitore non trovato.' });
    }

    const {
      ragioneSociale,
      partitaIva,
      codiceFiscale,
      codiceSdi,
      pec,
      indirizzoVia,
      indirizzoCap,
      indirizzoCitta,
      indirizzoProvincia,
      indirizzoNazione,
      telefono,
      email,
      sitoWeb,
      isActive,
    } = req.body;

    if (ragioneSociale === '') {
      return res.status(400).json({ message: 'La ragione sociale non può essere vuota.' });
    }

    await supplier.update({
      ragioneSociale: ragioneSociale ?? supplier.ragioneSociale,
      partitaIva: partitaIva !== undefined ? partitaIva : supplier.partitaIva,
      codiceFiscale: codiceFiscale !== undefined ? codiceFiscale : supplier.codiceFiscale,
      codiceSdi: codiceSdi !== undefined ? codiceSdi : supplier.codiceSdi,
      pec: pec !== undefined ? pec : supplier.pec,
      indirizzoVia: indirizzoVia !== undefined ? indirizzoVia : supplier.indirizzoVia,
      indirizzoCap: indirizzoCap !== undefined ? indirizzoCap : supplier.indirizzoCap,
      indirizzoCitta: indirizzoCitta !== undefined ? indirizzoCitta : supplier.indirizzoCitta,
      indirizzoProvincia: indirizzoProvincia !== undefined ? indirizzoProvincia : supplier.indirizzoProvincia,
      indirizzoNazione: indirizzoNazione !== undefined ? indirizzoNazione : supplier.indirizzoNazione,
      telefono: telefono !== undefined ? telefono : supplier.telefono,
      email: email !== undefined ? email : supplier.email,
      sitoWeb: sitoWeb !== undefined ? sitoWeb : supplier.sitoWeb,
      isActive: isActive !== undefined ? isActive : supplier.isActive,
      updatedByUserId: (req as any).user?.id || supplier.updatedByUserId,
    });

    res.json(supplier);
  } catch (error: any) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ message: 'Partita IVA già presente per un altro fornitore.' });
    }
    res.status(500).json({ message: 'Errore durante l\'aggiornamento del fornitore.' });
  }
});

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const supplier = await Supplier.findByPk(req.params.id as any);
    if (!supplier) {
      return res.status(404).json({ message: 'Fornitore non trovato.' });
    }

    await supplier.destroy();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Errore durante l\'eliminazione del fornitore.' });
  }
});

export default router;
