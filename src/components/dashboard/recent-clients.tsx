import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { recentClients } from "@/app/admin/data/dashboard";

export function RecentClients() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Clients récents</CardTitle>
        <CardDescription>
          Aperçu des clients les plus actifs.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Factures</TableHead>
              <TableHead className="text-right">Total dépensé</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentClients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.id}</TableCell>
                <TableCell>{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.invoices}</TableCell>
                <TableCell className="text-right">{client.totalSpent}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
