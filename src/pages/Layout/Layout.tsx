import { Link, Outlet, useLocation } from "react-router-dom";
import "./Layout.scss"; 

const Layout = () => {
  const { pathname } = useLocation();
  const isOnWishlist = pathname === "/wishlist" || pathname.startsWith("/wishlist/");

  return (
    <div className="layout-container">
      <header className="layout-header">
        <h1 className="layout-logo">
          <Link to="/" className="layout-homeLink" aria-label="Go to home">
            Movie App
          </Link>
        </h1>
      </header>

      <main className="layout-main" role="main">
        <div className="layout-toolbar">
          {!isOnWishlist && (
            <Link
              to="/wishlist"
              className="layout-wishlistBtn"
              aria-label="Open wish list"
            >
              Wish list
            </Link>
          )}
        </div>

        <Outlet />
      </main>

      <footer className="layout-footer">Movie App 2025.</footer>
    </div>
  );
};

export default Layout;
