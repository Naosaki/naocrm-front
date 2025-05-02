import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { statsData } from "@/app/admin/data/dashboard";

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((item, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              {item.title === "Clients" && (
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              )}
              {item.title === "Clients" && (
                <circle cx="9" cy="7" r="4" />
              )}
              {item.title === "Factures" && (
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              )}
              {item.title === "Produits" && (
                <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14" />
              )}
              {item.title === "Produits" && (
                <path d="M16.5 9.4 7.55 4.24" />
              )}
              {item.title === "Revenus" && (
                <>
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </>
              )}
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
            {item.change && (
              <div className={`mt-2 flex items-center text-xs ${item.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}>
                {item.changeType === 'positive' ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="mr-1 h-3 w-3"
                  >
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="mr-1 h-3 w-3"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                )}
                {item.change}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
