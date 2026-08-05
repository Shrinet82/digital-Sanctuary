"use client";

import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { signIn, signUp, type AuthState } from "@/app/auth/actions";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="ds-btn ds-btn-primary w-full justify-center disabled:opacity-60"
    >
      {pending ? "One moment…" : label}
    </button>
  );
}

export function AuthForm({ mode }: { mode: "signin" | "signup" }) {
  const isSignUp = mode === "signup";
  const action = isSignUp ? signUp : signIn;
  const [state, formAction] = useFormState<AuthState, FormData>(action, {});

  // Signup succeeded but needs email confirmation — show a calm, clear next step.
  if (state.notice) {
    return (
      <div className="ds-card text-center">
        <span className="text-4xl">📬</span>
        <h2 className="text-2xl mt-3 mb-2">Check your email</h2>
        <p className="text-ink-soft text-[15px] mb-4">{state.notice}</p>
        <div className="rounded-xl border-2 border-dashed border-ink bg-white/70 p-4 text-sm text-ink-soft text-left">
          <p className="m-0">
            Click the link in that email and you&apos;ll be brought straight
            back here, signed in. If it doesn&apos;t arrive in a minute or two,
            check your spam folder.
          </p>
        </div>
        <Link
          href="/login"
          className="ds-btn ds-btn-ghost w-full justify-center no-underline mt-4"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="ds-card">
      <form action={formAction} className="space-y-4">
        {isSignUp && (
          <div>
            <label htmlFor="display_name" className="block font-bold text-sm mb-2">
              What should we call you? <span className="text-ink-faint font-medium">(optional)</span>
            </label>
            <input
              id="display_name"
              name="display_name"
              type="text"
              autoComplete="nickname"
              className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface"
              placeholder="A name, a nickname, anything"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block font-bold text-sm mb-2">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block font-bold text-sm mb-2">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            className="w-full border-2.5 border-ink rounded-[14px] px-4 py-3 bg-surface"
            placeholder={isSignUp ? "At least 8 characters" : "Your password"}
          />
        </div>

        {state.error && (
          <p
            role="alert"
            className="text-sm font-semibold text-[#B03A2E] bg-coral-soft border-2 border-ink rounded-xl px-4 py-3"
          >
            {state.error}
          </p>
        )}
        <SubmitButton label={isSignUp ? "Create my account →" : "Sign in →"} />
      </form>

      <p className="text-sm text-ink-soft mt-5">
        {isSignUp ? (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-violet-deep underline underline-offset-2">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New here?{" "}
            <Link href="/signup" className="font-bold text-violet-deep underline underline-offset-2">
              Create an account
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
