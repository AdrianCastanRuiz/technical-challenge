import Carousel from '../components/Carousel';
import styles from './Home.module.scss';

export default function Home() {
  return (
    <main className={styles.container}>
      <Carousel title="Action"  genreId={28} />
      <Carousel title="Comedy" genreId={35} />
      <Carousel title="Drama"   genreId={18} />
    </main>
  );
}
