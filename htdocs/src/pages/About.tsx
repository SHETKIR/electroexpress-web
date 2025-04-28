import React from 'react';

const About: React.FC = () => {
  return (
    <div className="about-page">
      <h1>О нас</h1>
      <div className="about-content">
        <section className="about-section">
          <h2>Наша компания</h2>
          <p>
            Что то делает
          </p>
        </section>
        
        <section className="about-section">
          <h2>Наша миссия</h2>
          <p>
            Убить боба
          </p>
        </section>
        
        <section className="about-section">
          <h2>Наша команда</h2>
          <p>
           1 студент, который работает за кириешки
          </p>
        </section>
      </div>
    </div>
  );
};

export default About; 