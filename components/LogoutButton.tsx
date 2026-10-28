'use client';
export default function LogoutButton() {
  return <button className="btn-ghost" onClick={async () => { await fetch('/api/passport/logout', { method: 'POST' }); location.href = '/'; }}>Sign out of this device</button>;
}
