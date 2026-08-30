const testimonials = [
  {
    author: "Learner, Nairobi",
    text: "UniPam helped me combine global courses with a clear roadmap to become job-ready."
  },
  {
    author: "Learner, Accra",
    text: "The dashboard and certificate wallet made my learning progress visible and credible."
  },
  {
    author: "Instructor Partner",
    text: "UniPam gave our institution a practical digital channel for skill-focused programs."
  }
];

function TestimonialPage() {
  return (
    <section>
      <h1>Testimonials</h1>
      <div className="course-grid">
        {testimonials.map((item) => (
          <article key={item.author} className="card course-card">
            <p>"{item.text}"</p>
            <p className="muted">{item.author}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

export default TestimonialPage;
