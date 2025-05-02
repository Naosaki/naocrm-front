// Données pour le tableau de bord administrateur

// Données pour les cartes de statistiques
export const statsData = [
  {
    title: "Clients",
    value: "24",
    description: "Total des clients",
    change: "+12%",
    changeType: "positive",
  },
  {
    title: "Factures",
    value: "132",
    description: "Factures émises",
    change: "+8%",
    changeType: "positive",
  },
  {
    title: "Produits",
    value: "45",
    description: "Produits en stock",
    change: "-2%",
    changeType: "negative",
  },
  {
    title: "Revenus",
    value: "28 500 €",
    description: "Revenus ce mois-ci",
    change: "+18%",
    changeType: "positive",
  },
];

// Données pour le graphique des revenus
export const revenueData = [
  { name: "Jan", total: 12500 },
  { name: "Fév", total: 18000 },
  { name: "Mar", total: 15500 },
  { name: "Avr", total: 22000 },
  { name: "Mai", total: 19000 },
  { name: "Juin", total: 25000 },
  { name: "Juil", total: 21000 },
  { name: "Août", total: 18500 },
  { name: "Sep", total: 23000 },
  { name: "Oct", total: 26000 },
  { name: "Nov", total: 24500 },
  { name: "Déc", total: 28500 },
];

// Données pour le tableau des factures récentes
export const recentInvoices = [
  {
    id: "INV-001",
    client: "Entreprise ABC",
    status: "Payée",
    amount: "2 500 €",
    date: "2025-04-25",
  },
  {
    id: "INV-002",
    client: "Société XYZ",
    status: "En attente",
    amount: "1 800 €",
    date: "2025-04-28",
  },
  {
    id: "INV-003",
    client: "Compagnie 123",
    status: "Payée",
    amount: "3 200 €",
    date: "2025-04-20",
  },
  {
    id: "INV-004",
    client: "Entreprise DEF",
    status: "En retard",
    amount: "1 500 €",
    date: "2025-04-15",
  },
  {
    id: "INV-005",
    client: "Société GHI",
    status: "Payée",
    amount: "2 800 €",
    date: "2025-04-22",
  },
];

// Données pour le tableau des clients récents
export const recentClients = [
  {
    id: "CLT-001",
    name: "Entreprise ABC",
    email: "contact@abc.com",
    invoices: "12",
    totalSpent: "28 500 €",
  },
  {
    id: "CLT-002",
    name: "Société XYZ",
    email: "info@xyz.com",
    invoices: "8",
    totalSpent: "15 800 €",
  },
  {
    id: "CLT-003",
    name: "Compagnie 123",
    email: "contact@123.com",
    invoices: "15",
    totalSpent: "32 200 €",
  },
  {
    id: "CLT-004",
    name: "Entreprise DEF",
    email: "info@def.com",
    invoices: "6",
    totalSpent: "12 500 €",
  },
  {
    id: "CLT-005",
    name: "Société GHI",
    email: "contact@ghi.com",
    invoices: "10",
    totalSpent: "22 800 €",
  },
];
