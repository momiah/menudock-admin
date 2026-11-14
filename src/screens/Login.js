import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function Login({ notAdmin }) {
  const { signIn, signOutUser, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);
  const [mode, setMode] = useState("signin"); // signin | reset | sent

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await signIn(email.trim(), password);
    } catch {
      setErr("Incorrect email or password.");
    } finally {
      setBusy(false);
    }
  }

  async function sendReset(e) {
    e.preventDefault();
    setErr(null);
    if (!email.trim()) {
      setErr("Enter your email address.");
      return;
    }
    setBusy(true);
    try {
      await resetPassword(email.trim());
      setMode("sent");
    } catch (e2) {
      if (e2?.code === "auth/invalid-email") setErr("That doesn't look like an email address.");
      else if (e2?.code === "auth/too-many-requests") setErr("Too many attempts. Please wait a few minutes and try again.");
      // Don't reveal whether the address has an account.
      else if (e2?.code === "auth/user-not-found") setMode("sent");
      else setErr("Couldn't send the email. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const switchTo = (next) => () => {
    setErr(null);
    setMode(next);
  };

  return (
    <div className="login">
      <form className="card" onSubmit={mode === "reset" ? sendReset : submit}>
        <div className="logo"><div className="mark">M</div><div className="name">Menu<span>Dock</span></div></div>
        <h2>{mode === "signin" ? "Admin console" : "Reset your password"}</h2>
        <div className="sub">
          {notAdmin
            ? "This account isn't a MenuDock admin."
            : mode === "signin"
            ? "Sign in to manage your restaurant clients."
            : mode === "reset"
            ? "Enter your email and we'll send you a link to choose a new password."
            : `If ${email.trim()} has an account, a reset link is on its way. Check your inbox (and spam).`}
        </div>

        {notAdmin ? (
          <button type="button" className="btn" onClick={signOutUser}>Sign out</button>
        ) : mode === "sent" ? (
          <button type="button" className="btn primary" onClick={switchTo("signin")}>Back to sign in</button>
        ) : (
          <>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            {mode === "signin" && (
              <div className="field">
                <label htmlFor="password">Password</label>
                <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
            )}
            {err && <div className="err">{err}</div>}
            <button className="btn primary" disabled={busy}>
              {mode === "reset" ? (busy ? "Sending…" : "Send reset link") : busy ? "Signing in…" : "Sign in"}
            </button>
            <button type="button" className="linkbtn" onClick={switchTo(mode === "signin" ? "reset" : "signin")}>
              {mode === "signin" ? "Forgot password?" : "Back to sign in"}
            </button>
          </>
        )}
      </form>
    </div>
  );
}
