import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Autoplay, Navigation } from 'swiper/modules'; // 1. Adicionado Navigation

// Importe os estilos do Swiper
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation'; // 2. Importado o CSS das setas
import "./testemunhos.css";

function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Eliane Pereira",
      role: "Cliente P&B",
      text: "É preciso ter uma alma muito generosa para espalhar beleza dessa forma, permitindo que outras mulheres carreguem consigo um pedaço da sua arte e do seu coração e, se sintam mais leves, mais vibrantes e muito mais lindas.. É assim que me sinto e quero continuar me sentindo… Admirável!",
    },
    {
      id: 2,
      name: "Ana Paula Rajo",
      role: "Cliente P&B",
      text: "As bijus da Patrícia são simplesmente lindas! Além do design impecável, a qualidade é excelente: não estragam, permanecem sempre novas e bem cuidadas. O atendimento é atencioso e transmite confiança. Fico muito satisfeita com cada compra.",
    },
    {
      id: 3,
      name: "Magaly Evangelista",
      role: "Cliente P&B",
      text: "Eu adoro as bijuterias que comprei na P&B! São além de lindas, preço bom, duráveis e de excelente qualidade! Super indico!!",
    },
    {
      id: 4,
      name: "Cintia",
      role: "Cliente P&B",
      text: "Só comprem, atendimento excelente nota 1000! Qualidade do produto impecável, diferente, sofisticado e brilhoso. Quem confecciona, tem mãos de fadas e faz tudo com muito amor, para atender e aumentar nosso alto estima.",
    },
    {
      id: 5,
      name: "Vanessa",
      role: "Cliente P&B",
      text: "Presenteei com as peças de P&B, duas pessoas queridas da minha família, elas amaram pois são feitas com alta qualidade e lindas as peças.",
    },
     {
      id: 6,
      name: "Neide",
      role: "Cliente P&B",
      text: "Eu sou cliente da Paty bijus há muitos anos. Peças de excelente qualidade, uma pessoa idônea, tem um cuidado essencial com os clientes em satisfaze-los. Apostem que com certeza irão fazer belas compras",
    },
  ];

  return (
    <section className="testimonials" id="testemunhos">
      <div className="testimonials-container">
        {/* Cabeçalho da seção */}
        <div className="testimonials-heading">
          <p className="testimonials-eyebrow">DEPOIMENTOS</p>

          <h2>
            O que nossas clientes
            <span> dizem sobre nós</span>
          </h2>

          <p className="testimonials-introduction">
            Confira as experiências de quem já conhece a P&B.
          </p>
        </div>

        {/* Carrossel de testemunhos */}
        <Swiper
          modules={[Pagination, Autoplay, Navigation]} // 3. Adicionado o módulo aqui
          spaceBetween={24}
          slidesPerView={1}
          navigation={true} // 4. Habilita as setas de navegação
          autoplay={{ delay: 6000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }, // Mostra 3 cards em telas grandes, igual ao seu layout original
          }}
          className="testimonials-swiper pb-12"
        >
          {testimonials.map((testimonial) => (
            <SwiperSlide key={testimonial.id} className="h-auto">
              <article className="testimonial-card h-full flex flex-col justify-between">
                <div>
                  {/* Espaço reservado para uma avaliação em estrelas */}
                  <div className="testimonial-stars" aria-label="Avaliação">
                    ★ ★ ★ ★ ★
                  </div>

                  <blockquote>
                    “{testimonial.text}”
                  </blockquote>
                </div>

                <div className="testimonial-author">
                  <div className="testimonial-avatar">
                    {testimonial.name.charAt(0)}
                  </div>

                  <div>
                    <h3>{testimonial.name}</h3>
                    <p>{testimonial.role}</p>
                  </div>
                </div>
              </article>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}

export default Testimonials;