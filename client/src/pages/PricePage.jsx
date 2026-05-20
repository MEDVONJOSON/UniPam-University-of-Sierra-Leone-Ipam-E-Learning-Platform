const plans = [
  { name: "Starter", price: "Free", points: ["Catalog access", "Dashboard", "Basic recommendations"] },
  {
    name: "Premium",
    price: "$12/mo",
    points: ["Advanced recommendations", "Learning analytics", "Priority support"]
  },
  {
    name: "Enterprise",
    price: "Custom",
    points: ["Corporate cohorts", "Admin reporting", "Dedicated partnership support"]
  }
];

function PricePage() {
  return (
    <section>
      <h1>Pricing</h1>
      <div className="course-grid">
        {plans.map((plan) => (
          <article key={plan.name} className="card course-card">
            <h3>{plan.name}</h3>
            <p className="kicker">{plan.price}</p>
            <ul>
              {plan.points.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

export default PricePage;
