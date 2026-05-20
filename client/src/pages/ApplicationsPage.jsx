const sectors = [
  "University and college skill programs",
  "Public sector upskilling initiatives",
  "Corporate workforce transformation",
  "Youth employability and digital bootcamps"
];

function ApplicationsPage() {
  return (
    <section className="card">
      <h1>Applications</h1>
      <p className="muted">How institutions and organizations apply UniPam in real contexts.</p>
      <ul>
        {sectors.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-6">Powered by the University Of Sierra Leone</p>
    </section>
  );
}

export default ApplicationsPage;
