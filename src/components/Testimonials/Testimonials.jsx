// components/Testimonials/Testimonials.jsx
import React from 'react';

const Testimonials = () => {
  const testimonials = [
    {
      content: "DubMaster has revolutionized how we create content for our Indian audience. The Hindi dubbing is so natural that viewers can't tell it's AI-generated!",
      author: "Raj Sharma",
      role: "Content Creator",
      avatar: "RS"
    },
    {
      content: "As an educator, I needed to make my courses accessible to Marathi-speaking students. DubMaster made this process effortless and the quality is outstanding.",
      author: "Priya Kulkarni",
      role: "Online Educator",
      avatar: "PK"
    },
    {
      content: "Our marketing videos now reach a much wider audience thanks to the high-quality dubbing. The processing time is incredibly fast compared to manual dubbing.",
      author: "Amit Mehta",
      role: "Marketing Director",
      avatar: "AM"
    }
  ];

  return (
    <section className="section testimonials" id="testimonials">
      <div className="container">
        <div className="section-title">
          <h2>What Our Users Say</h2>
          <p>Join thousands of satisfied users who have transformed their content</p>
        </div>
        <div className="testimonial-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-content">
                {testimonial.content}
              </div>
              <div className="testimonial-author">
                <div className="author-avatar">{testimonial.avatar}</div>
                <div>
                  <h4>{testimonial.author}</h4>
                  <p>{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;