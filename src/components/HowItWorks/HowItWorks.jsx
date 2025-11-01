// components/HowItWorks/HowItWorks.jsx
import React from 'react';

const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: "Voice Recognition",
      description: "Our AI identifies and transcribes the original audio in your video with high accuracy."
    },
    {
      number: 2,
      title: "Language Translation",
      description: "Advanced translation algorithms convert the text to your target language while preserving context."
    },
    {
      number: 3,
      title: "Voice Synthesis",
      description: "AI generates natural-sounding speech in the target language that matches the original timing."
    },
    {
      number: 4,
      title: "Video Synthesis",
      description: "The synthesized audio is perfectly synchronized with the video to create the final dubbed content."
    }
  ];

  return (
    <section className="section how-it-works" id="how-it-works">
      <div className="container">
        <div className="section-title">
          <h2>How Our Technology Works</h2>
          <p>Advanced AI processes your video to create natural-sounding dubbed content</p>
        </div>
        <div className="how-steps">
          {steps.map((step, index) => (
            <div key={index} className="how-step">
              <div className="how-step-number">{step.number}</div>
              <div className="how-step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;