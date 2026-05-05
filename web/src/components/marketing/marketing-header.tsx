import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";

export function MarketingHeader() {
  const t = useTranslations("auth");

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/sign-in" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            {siteConfig.name}
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">
              {t("signIn")}
            </Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm">{t("createAccount")}</Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
