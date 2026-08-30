const members = [
  { name: "Program Lead", focus: "Learning roadmap design and quality standards" },
  { name: "Partnership Manager", focus: "University and provider collaboration" },
  { name: "Engineering Lead", focus: "Platform architecture and delivery" },
  { name: "Learner Support", focus: "Student onboarding and retention support" }
];

function TeamPage() {
  return (
    <section>
      <h1>Team</h1>
      <p className="muted">The multidisciplinary group building UniPam.</p>
      <div className="course-grid">
        {members.map((member) => (
          <article key={member.name} className="card course-card">
            <h3>{member.name}</h3>
            <p>{member.focus}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TeamPage;
