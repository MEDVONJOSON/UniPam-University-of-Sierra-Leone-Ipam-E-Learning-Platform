import { useState } from "react";

function QuotePage() {
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(event) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <section className="card auth-card">
      <h1>Request a Training Quote</h1>
      <form className="form-grid" onSubmit={onSubmit}>
        <label>
          Organization Name
          <input required />
        </label>
        <label>
          Contact Email
          <input type="email" required />
        </label>
        <label>
          Team Size
          <input required />
        </label>
        <label>
          Goals
          <textarea rows="4" required />
        </label>
        <button className="btn" type="submit">
          Submit
        </button>
      </form>
      {submitted && <p className="success">Quote request submitted.</p>}
    </section>
  );
}

export default QuotePage;
