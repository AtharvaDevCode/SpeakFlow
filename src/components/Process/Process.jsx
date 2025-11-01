// components/Process/Process.jsx
import React from 'react';

const Process = () => {
  const steps = [
    { number: 1, title: "Upload Video", description: "Upload your English video file" },
    { number: 2, title: "Select Language", description: "Choose target language (Hindi, Marathi, etc.)" },
    { number: 3, title: "Get Dubbed Video", description: "Download your dubbed video instantly" },
    { number: 4, title: "Share & Enjoy", description: "Share your content with a global audience" }
  ];

  return (
    <section className="process" id="process">
      <div className="container">
        <div className="section-title">
          <h2>Simple 3-Step Process</h2>
          <p>Transform your videos in just three easy steps</p>
        </div>
        <div className="steps">
          {steps.map((step, index) => (
            <div key={index} className="step">
              <div className="step-number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Process;