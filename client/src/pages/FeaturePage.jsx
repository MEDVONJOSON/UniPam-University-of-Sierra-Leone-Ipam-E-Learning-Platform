const features = [
  "Unified course catalog across providers",
  "Role-based accounts for learners and institutions",
  "Tracked redirect enrollment flow",
  "Progress dashboard and recommendations",
  "Certificate wallet with visibility controls"
];

function FeaturePage() {
  return (
    <section className="card">
      <h1>Platform Features</h1>
      <ul>
        {features.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

export default FeaturePage;
