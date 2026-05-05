"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { acceptInvitation, type TeamRole } from "@/lib/actions/team";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Users } from "lucide-react";

interface Props {
  token: string;
  organizationName: string;
  email: string;
  role: TeamRole;
  currentUserEmail: string;
  emailMatches: boolean;
}

function roleLabel(role: TeamRole): string {
  switch (role) {
    case "admin":
      return "Admin";
    case "manager":
      return "Manager";
    case "analyst":
      return "Analyst";
    case "agency_partner":
      return "Agency Partner";
  }
}

export function AcceptInvitationCard({
  token,
  organizationName,
  email,
  role,
  currentUserEmail,
  emailMatches,
}: Props) {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  async function handleAccept() {
    setIsAccepting(true);
    try {
      await acceptInvitation(token);
      toast.success(`Welcome to ${organizationName}!`);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to accept invitation",
      );
      setIsAccepting(false);
    }
  }

  async function handleSwitchAccount() {
    setIsSwitching(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push(
      `/sign-up?invite=${token}&email=${encodeURIComponent(email)}&next=${encodeURIComponent(
        `/invite/${token}`,
      )}`,
    );
    router.refresh();
  }

  return (
    <div className="rounded-xl border bg-card p-6 shadow-sm">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-xl font-semibold tracking-tight">
          Join {organizationName}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You&apos;ve been invited to join as{" "}
          <span className="font-medium text-foreground">{roleLabel(role)}</span>
        </p>
      </div>

      <div className="space-y-3 rounded-lg border bg-muted/30 p-3 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Invited email</span>
          <span className="font-medium">{email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Signed in as</span>
          <span className="font-medium">{currentUserEmail}</span>
        </div>
      </div>

      {!emailMatches ? (
        <div className="mt-6 space-y-3">
          <p className="text-sm text-destructive">
            This invitation was sent to{" "}
            <span className="font-medium">{email}</span>, but you&apos;re signed
            in as {currentUserEmail}. Please switch accounts to continue.
          </p>
          <Button
            onClick={handleSwitchAccount}
            disabled={isSwitching}
            className="w-full"
          >
            {isSwitching ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Switching...
              </>
            ) : (
              "Sign out and use correct account"
            )}
          </Button>
        </div>
      ) : (
        <Button
          onClick={handleAccept}
          disabled={isAccepting}
          className="mt-6 w-full"
        >
          {isAccepting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Joining...
            </>
          ) : (
            `Accept and join ${organizationName}`
          )}
        </Button>
      )}
    </div>
  );
}
