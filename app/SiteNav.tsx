export function SiteNav() {
  return (
    <nav className="wp-nav site-nav">
      <div className="wp-nav-brand auth-nav-brand">
        <img src="/logo-stacked-white.webp" alt="SquadScout AI" width={66} height={52} />
      </div>
      <div className="wp-nav-links">
        <a className="wp-link" href="/">
          Home
        </a>
        <a className="wp-link" href="/sign-in">
          Sign in
        </a>
        <a className="wp-btn wp-btn-primary" href="/sign-up">
          Get started
        </a>
      </div>
    </nav>
  );
}
