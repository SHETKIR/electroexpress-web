import React from 'react';

const Contact: React.FC = () => {
  return (
    <div className="about-page">
      <h1>Контакты</h1>
      <div className="about-content">
        <section className="about-section">
          <h2>Связь с нами</h2>
          <p>
            Мы на контакт не выходим, мы только слушаем
          </p>
        </section>
        
        <section className="about-section">
          <h2>Адрес</h2>
          <p>
            Нагорная, 78, Самара, Самарская обл., 443016
          </p>
        </section>
        
        <section className="about-section">
          <h2>Режим работы</h2>
          <p>
            Когда хотим, тогда и работаем
          </p>
        </section>
      </div>
    </div>
  );
};

export default Contact; 