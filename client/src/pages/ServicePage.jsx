const services = [
  "Course aggregation and discovery",
  "Learning roadmap guidance",
  "Certificate wallet and portfolio",
  "Admin publishing and analytics",
  "Institution partnership onboarding"
];

function ServicePage() {
  return (
    <section className="card">
      <h1>Services</h1>
      <p className="muted">Core platform services delivered by UniPam.</p>
      <ul>
        {services.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default ServicePage;
