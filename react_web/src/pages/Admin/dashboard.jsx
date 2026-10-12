import Sidebar from "../../components/Admin/Sidebar/sidebar";
import AdminHeader from "../../components/Admin/AdminHeader/adminheader";

import "./dashboard.css";

function Dashboard() {
  const statistics = [
    {
      title: "Produtos cadastrados",
      value: "24",
    },
    {
      title: "Produtos disponíveis",
      value: "18",
    },
    {
      title: "Baixo estoque",
      value: "3",
    },
    {
      title: "Indisponíveis",
      value: "6",
    },
  ];

  return (
    <div className="admin-layout">

      <Sidebar />

      <div className="admin-main">

        <AdminHeader />

        <main className="dashboard">

          <div className="dashboard-intro">
            <p className="dashboard-eyebrow">
              VISÃO GERAL
            </p>

            <h1>Dashboard</h1>

            <p>
              Acompanhe as principais informações
              do seu estoque.
            </p>
          </div>

          <section className="dashboard-statistics">

            {statistics.map((statistic) => (
              <article
                className="dashboard-card"
                key={statistic.title}
              >
                <p>{statistic.title}</p>

                <strong>
                  {statistic.value}
                </strong>
              </article>
            ))}

          </section>

          <section className="dashboard-section">

            <div className="dashboard-section-header">
              <div>
                <p className="dashboard-eyebrow">
                  PRODUTOS
                </p>

                <h2>
                  Produtos recentes
                </h2>
              </div>
            </div>

            <div className="dashboard-empty">
              <p>
                Os produtos cadastrados aparecerão
                aqui.
              </p>
            </div>

          </section>

        </main>

      </div>

    </div>
  );
}

export default Dashboard;