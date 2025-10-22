import React, { useState } from 'react';
import '../styles/PhotoGallery.css';

// Import selected food images
import fullbuffet1 from '../assets/fullbuffet1.png';
import fullbuffet2 from '../assets/fullbuffet2.png';
import savoury3 from '../assets/savoury3.png';
import wraps3 from '../assets/wraps3.png';
import dips3 from '../assets/dips3.png';
import dips4 from '../assets/dips4.png';

const PhotoGallery = () => {
  const images = [
    fullbuffet1,
    fullbuffet2,
    savoury3,
    wraps3,
    dips3,
    dips4
  ];

  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageClick = (image) => {
    setSelectedImage(image);
  };

  const handleCloseModal = () => {
    setSelectedImage(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  return (
    <section className="photo-gallery-section">
      <div className="gallery-container">
        <div className="gallery-header">
          <h2 className="gallery-title">Our Creations</h2>
          <p className="gallery-subtitle">Explore the variety and quality of our fresh, customizable buffets</p>
        </div>

        <div className="gallery-grid">
          {images.map((image, index) => (
            <div
              key={index}
              className="gallery-item"
              onClick={() => handleImageClick(image)}
            >
              <img src={image} alt={`Gallery item ${index + 1}`} />
              <div className="gallery-overlay">
                <span className="view-icon">+</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal for enlarged image */}
      {selectedImage && (
        <div className="gallery-modal" onClick={handleBackdropClick}>
          <div className="modal-content">
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            <img src={selectedImage} alt="Enlarged view" className="modal-image" />
          </div>
        </div>
      )}
    </section>
  );
};

export default PhotoGallery;

