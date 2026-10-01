import React, { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function Login({ notAdmin }) {
  const { signIn, signOutUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState(null);

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

  return (
    <div className="login">
      <form className="card" onSubmit={submit}>
        <div className="logo"><div className="mark">M</div><div className="name">Menu<span>Dock</span></div></div>
        <h2>Admin console</h2>
        <div className="sub">
          {notAdmin ? "This account isn't a MenuDock admin." : "Sign in to manage your restaurant clients."}
        </div>

        {notAdmin ? (
          <button type="button" className="btn" onClick={signOutUser}>Sign out</button>
        ) : (
          <>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {err && <div className="err">{err}</div>}
            <button className="btn primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
          </>
        )}
      </form>
    </div>
  );
}
