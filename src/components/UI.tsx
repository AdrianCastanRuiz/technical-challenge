import { Link, Outlet, useLocation } from "react-router-dom";
import styles from "./UI.module.scss";

const UI = () => {
  const { pathname } = useLocation();
  const isOnWishlist = pathname === "/wishlist" || pathname.startsWith("/wishlist/");

  return (
    <div className={styles.container}>
      <header>
        <h1 className={styles.logo}>
          <Link to="/" className={styles.homeLink} aria-label="Go to home">
            Movie App
          </Link>
        </h1>
      </header>

      <div className={styles.toolbar}>
        {!isOnWishlist && (
          <Link to="/wishlist" className={styles.wishlistBtn} aria-label="Open wish list">
            Wish list
          </Link>
        )}
      </div>
      <Outlet />
      <footer>Movie App 2025.</footer>
    </div>
  );
};

export default UI;
