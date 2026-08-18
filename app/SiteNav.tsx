export function SiteNav() {
  return (
    <nav className="wp-nav site-nav">
      <div className="wp-nav-brand auth-nav-brand">
        <img src="/logo-stacked-white.png" alt="SquadScout AI" />
      </div>
      <div className="wp-nav-links">
        <a className="wp-link" href="/welcome">
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
