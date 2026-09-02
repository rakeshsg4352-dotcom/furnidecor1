import { useState } from 'react';
import './Contact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });

  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !formData.message) {
      setError('Name, email, and message are required.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(formData.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSubmitting(true);

    // Simulate submission.
    // Connect this to a backend endpoint such as POST /api/contact
    // if messages need to be stored in the database.

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 600);
  };

  if (submitted) {
    return (
      <div className="contact-page">
        <div className="contact-success">
          <h2>Thank you for contacting FurniDecor.</h2>
          <p>We will get back to you soon.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contact-page">
      <h1>Contact Us</h1>

      <p className="contact-subtitle">
        We'd love to hear from you. Send us a message below.
      </p>

      {error && <div className="contact-error">{error}</div>}

      <form onSubmit={handleSubmit} className="contact-form">
        <div className="contact-form-row">
          <label>
            Name
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </label>
        </div>

        <div className="contact-form-row">
          <label>
            Phone
            <input
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </label>

          <label>
            Subject
            <input
              name="subject"
              value={formData.subject}
              onChange={handleChange}
            />
          </label>
        </div>

        <label>
          Message
          <textarea
            name="message"
            rows={6}
            value={formData.message}
            onChange={handleChange}
          />
        </label>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={submitting}
        >
          {submitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
}