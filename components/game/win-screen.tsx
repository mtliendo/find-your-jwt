import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ClaimResult } from "@/lib/game-types";

export function WinScreen({
  result,
  onReplay,
}: {
  result: Extract<ClaimResult, { ok: true }>;
  onReplay: () => void;
}) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-stone-950/80 p-6 backdrop-blur-sm">
      <Card className="w-full max-w-lg border-amber-200/20 bg-stone-950">
        <CardHeader>
          <Badge variant="amber">You found your JWT</Badge>
          <CardTitle className="mt-3 text-3xl">That one was yours.</CardTitle>
          <CardDescription>
            You did not win by decoding. Every token in the room could be
            decoded. You won because Auth0 JWKS verified the signature and the{" "}
            <code>sub</code> is you.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <dl className="grid gap-2 rounded-lg border border-white/5 bg-stone-900/80 p-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">sub</dt>
              <dd className="font-mono text-amber-100">{result.sub ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">email</dt>
              <dd className="font-mono text-amber-100">{result.email ?? "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">iss</dt>
              <dd className="max-w-[70%] truncate font-mono text-amber-100">
                {result.iss ?? "—"}
              </dd>
            </div>
          </dl>
          <p className="text-sm leading-6 text-stone-300">{result.verifyNote}</p>
          <div className="flex items-center justify-between gap-3">
            <Badge variant="teal">JWKS signature verified</Badge>
            <Button variant="amber" onClick={onReplay}>
              Hunt again
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Login by Auth0. Game by Focus Otter. Decode vs identity.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
