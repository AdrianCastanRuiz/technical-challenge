// Home.tsx (ejemplo)
import { CarouselProvider } from '../../contexts/CarouselContext';
import Carousel from '../../components/Carousel/Index';
import styles from './Home.module.scss';

export default function Home() {
  return (
    <main className={styles.container}>
      <CarouselProvider genreId={28} language="en-US" pageSize={5}>
        <Carousel title="Action" />
      </CarouselProvider>

      <CarouselProvider genreId={35} language="en-US" pageSize={5}>
        <Carousel title="Comedy" />
      </CarouselProvider>

      <CarouselProvider genreId={18} language="en-US" pageSize={5}>
        <Carousel title="Drama" />
      </CarouselProvider>
    </main>
  );
}
