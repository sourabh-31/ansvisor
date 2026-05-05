"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface Invoice {
  id: string;
  number: string | null;
  date: string | null;
  amount: number;
  currency: string;
  status: string | null;
  pdfUrl: string | null;
}

export function InvoiceList() {
  const t = useTranslations("settings");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stripe/invoices")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setInvoices(data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    );
  }

  if (invoices.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{t("noInvoices")}</p>
    );
  }

  function formatCurrency(amount: number, currency: string) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  function statusVariant(status: string | null) {
    switch (status) {
      case "paid":
        return "default" as const;
      case "open":
        return "secondary" as const;
      case "uncollectible":
      case "void":
        return "destructive" as const;
      default:
        return "outline" as const;
    }
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t("invoiceNumber")}</TableHead>
          <TableHead>{t("invoiceDate")}</TableHead>
          <TableHead>{t("invoiceAmount")}</TableHead>
          <TableHead>{t("invoiceStatus")}</TableHead>
          <TableHead className="text-right">{t("invoiceDownload")}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map((inv) => (
          <TableRow key={inv.id}>
            <TableCell className="font-medium">
              {inv.number ?? "—"}
            </TableCell>
            <TableCell>
              {inv.date
                ? new Date(inv.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : "—"}
            </TableCell>
            <TableCell>{formatCurrency(inv.amount, inv.currency)}</TableCell>
            <TableCell>
              <Badge variant={statusVariant(inv.status)}>
                {inv.status ?? "unknown"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              {inv.pdfUrl ? (
                <a
                  href={inv.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <Download className="h-4 w-4" />
                </a>
              ) : (
                "—"
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
