import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function LoginWall() {
  return (
    <main className="relative flex min-h-full flex-1 flex-col items-center justify-center overflow-hidden px-6 py-16">
      <div className="pointer-events-none absolute inset-0 office-glow" />
      <div className="relative z-10 mx-auto flex w-full max-w-xl flex-col gap-8">
        <div className="flex flex-col items-center text-center">
          <Badge variant="teal">Focus Otter</Badge>
          <p className="mt-3 text-xs tracking-[0.28em] text-amber-200/70 uppercase">
            @focusotter
          </p>
          <h1 className="font-heading mt-4 text-5xl font-semibold tracking-tight text-amber-50">
            Find Your JWT
          </h1>
          <p className="mt-4 max-w-md text-base leading-7 text-stone-300">
            A dim office. A hundred tokens that all look the same. One of them
            is yours. Walk the room with a magnifying glass. Decode freely.
            Claim only what belongs to you.
          </p>
        </div>

        <Card className="border-amber-200/10 bg-stone-950/70 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Sign in to play</CardTitle>
            <CardDescription>
              No guest mode. Your Auth0 ID token is the needle in the haystack.
              Anyone can decode a JWT. Winning means the{" "}
              <code className="text-amber-200">sub</code> is you.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <a
              href="/auth/login?screen_hint=signup"
              className={cn(buttonVariants({ variant: "amber", size: "lg" }), "w-full")}
            >
              Create an account
            </a>
            <a
              href="/auth/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "w-full")}
            >
              Log in with Auth0
            </a>
            <p className="text-center text-xs text-muted-foreground">
              Auth0 is the lock on the door. The game is the hunt.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
