import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InspectedToken } from "@/lib/game-types";
import { readClaim } from "@/lib/jwt";

export function DecodePanel({ inspected }: { inspected: InspectedToken | null }) {
  if (!inspected) {
    return (
      <Card className="border-white/5 bg-stone-950/80">
        <CardHeader>
          <CardTitle className="text-sm">Inspect</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Hover a token with the magnifying glass to decode it. Decoding is not
          the win.
        </CardContent>
      </Card>
    );
  }

  const { decoded } = inspected;
  const sub = readClaim(decoded.payload, "sub");
  const alg =
    decoded.header && typeof decoded.header.alg === "string"
      ? decoded.header.alg
      : "unknown";

  return (
    <Card className="border-white/5 bg-stone-950/90">
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm">Decoded JWT</CardTitle>
        <div className="flex gap-2">
          <Badge variant="outline">alg {alg}</Badge>
          <Badge variant="amber">anyone can decode</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3">
        {decoded.parseError ? (
          <p className="text-xs text-rose-200">{decoded.parseError}</p>
        ) : null}
        <div className="grid gap-3 md:grid-cols-2">
          <pre className="jwt-header max-h-40 overflow-auto rounded-md p-3 text-[11px] leading-5">
            {decoded.headerText || "—"}
          </pre>
          <pre className="jwt-payload max-h-40 overflow-auto rounded-md p-3 text-[11px] leading-5">
            {decoded.payloadText || "—"}
          </pre>
        </div>
        <p className="text-xs text-muted-foreground">
          <span className="text-stone-300">sub:</span> {sub ?? "missing"} · Click
          to claim. Win only if this subject is you.
        </p>
      </CardContent>
    </Card>
  );
}
