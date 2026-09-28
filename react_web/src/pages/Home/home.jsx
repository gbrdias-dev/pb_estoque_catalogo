import Header from "../../components/Header/header";
import Hero from "../../components/Hero/hero";
import About from "../../components/Sobre/Sobre";
import Benefits from "../../components/Beneficios/beneficios";
import Testimonials from "../../components/Testemunhos/testemunhos";
import Social from "../../components/Social/social";
import Footer from "../../components/Footer/footer";

function Home() {
  return (
    <>
      <Header />
      <Hero />
      <About />
      <Benefits />
      <Testimonials />
      <Social />
      <Footer />
    </>
  );
}

export default Home;