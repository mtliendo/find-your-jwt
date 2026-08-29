import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { PlayerProfile } from "@/lib/game-types";

export function MissingIdToken({ player }: { player: PlayerProfile }) {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-6">
      <Card className="max-w-lg border-amber-200/10 bg-stone-950/80">
        <CardHeader>
          <Badge variant="rose">ID token missing</Badge>
          <CardTitle className="mt-3">Signed in, but no needle.</CardTitle>
          <CardDescription>
            Auth0 created a session for {player.email ?? player.sub}, but the
            ID token was not in the cookie. This demo needs the real ID token —
            that is the token you hunt.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 text-sm text-stone-300">
          <p>
            Confirm the Auth0 app is a Regular Web Application with the{" "}
            <code>openid</code> scope, then log in again.
          </p>
          <a
            href="/auth/logout"
            className={cn(buttonVariants({ variant: "amber" }), "w-fit")}
          >
            Log out and retry
          </a>
        </CardContent>
      </Card>
    </main>
  );
}
