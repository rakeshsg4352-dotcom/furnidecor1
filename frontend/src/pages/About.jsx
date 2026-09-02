import './About.css';

export default function About() {
  return (
    <div className="about-page">
      <div className="about-hero">
        <h1>About FurniDecor</h1>
        <p>Modern furniture and inspiring interiors for homes and workplaces.</p>
      </div>

      <div className="about-section">
        <h2>Who We Are</h2>
        <p>
          FurniDecor is a furniture and interior-decoration platform built to help people
          furnish and design the spaces they live and work in. From cozy bedrooms to
          productive home offices, we bring together a premium catalog and curated room
          recommendations in one place.
        </p>
      </div>

      <div className="about-section">
        <h2>Our Vision</h2>
        <p>
          To make thoughtful, well-designed furniture accessible to every home and
          workplace, without compromising on quality or style.
        </p>
      </div>

      <div className="about-section">
        <h2>Our Mission</h2>
        <p>
          We aim to simplify furniture shopping by pairing every product with real room
          context, so customers don't just buy furniture; they design a space.
        </p>
      </div>

      <div className="about-section">
        <h2>Our Design Philosophy</h2>
        <p>
          Clean lines, natural materials, and timeless silhouettes. We believe furniture
          should feel calm, functional, and built to last.
        </p>
      </div>

      <div className="about-section">
        <h2>Why Choose FurniDecor</h2>
        <ul>
          <li>Premium quality, carefully sourced materials</li>
          <li>Modern designs curated for real spaces</li>
          <li>Transparent pricing with no hidden costs</li>
          <li>Secure shopping and reliable delivery</li>
          <li>Responsive customer support</li>
        </ul>
      </div>
    </div>
  );
}
