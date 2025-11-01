// components/Features/Features.jsx
import React from 'react';
import FeatureCard from './FeatureCard/FeatureCard';

const Features = () => {
  const features = [
    {
      icon: "fas fa-language",
      title: "Multilingual Support",
      description: "Convert your videos to Hindi, Marathi, Tamil, Telugu, and many more languages with native-like pronunciation."
    },
    {
      icon: "fas fa-microphone",
      title: "Natural Voices",
      description: "Our AI generates human-like voices that sound natural and match the original speaker's emotion and tone."
    },
    {
      icon: "fas fa-bolt",
      title: "Fast Processing",
      description: "Dub your videos in minutes, not hours. Our optimized algorithms ensure quick processing without compromising quality."
    }
  ];

  return (
    <section className="section" id="features">
      <div className="container">
        <div className="section-title">
          <h2>Powerful Dubbing Features</h2>
          <p>Our advanced AI technology ensures high-quality, natural-sounding voice dubbing for your videos</p>
        </div>
        <div className="features">
          {features.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;