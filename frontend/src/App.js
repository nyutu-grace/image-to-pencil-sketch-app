import React, { useState } from 'react';
import './App.css';
import logo from './assets/images/logo.png';
import sketch1 from './assets/sketches/sketch1.png';
import sketch2 from './assets/sketches/sketch2.jpg';
import girl from './assets/images/girl.png';
import mice from './assets/images/mice.jpeg';

function App() {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [sketchUrls, setSketchUrls] = useState([]);
  const [animeUrls, setAnimeUrls] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
    setPreviewUrls(files.map(file => URL.createObjectURL(file)));
    setSketchUrls([]);
    setAnimeUrls([]);
  };

  const handleConvertToSketch = async () => {
    if (selectedFiles.length === 0) return;

    const sketchPromises = selectedFiles.map(async (file) => {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://127.0.0.1:5000/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      return `data:image/jpeg;base64,${data.sketch}`;
    });

    try {
      const sketches = await Promise.all(sketchPromises);
      setSketchUrls(sketches);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleConvertToAnime = async () => {
    if (selectedFiles.length === 0) return;

    const animePromises = selectedFiles.map(async (file) => {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('http://127.0.0.1:5000/upload_anime', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      return `data:image/jpeg;base64,${data.anime}`;
    });

    try {
      const animes = await Promise.all(animePromises);
      setAnimeUrls(animes);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="App">
      <nav className="navbar navbar-light bg-light sticky-navbar">
        <a className="navbar-brand" href="/">
          <img src={logo} alt="Logo" className="logo" />
        </a>
      </nav>
      <header className="header">
        <h1 className="header-title">Easily convert any photo to sketch or anime</h1>
        <p className="header-subtitle">
          Take a fresh look at ordinary images and uncover your passion for sketch-style or anime-style art.
        </p>

        <div className="button-group">
          <label htmlFor="upload-photo" className="btn btn-dark btn-lg">
            Upload photos
          </label>
          <input
            type="file"
            id="upload-photo"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept="image/*"
            multiple
          />
          <button
            className="btn btn-primary btn-lg"
            onClick={handleConvertToSketch}
            disabled={selectedFiles.length === 0}
          >
            Convert to Sketch
          </button>
          <button
            className="btn btn-warning btn-lg"
            onClick={handleConvertToAnime}
            disabled={selectedFiles.length === 0}
          >
            Convert to Anime
          </button>
        </div>

        {previewUrls.length > 0 && (
          <div className="image-preview mt-4">
            <h5>Original Images:</h5>
            <div className="preview-grid">
              {previewUrls.map((url, index) => (
                <img key={index} src={url} alt={`Preview ${index}`} className="img-thumbnail" />
              ))}
            </div>
          </div>
        )}

        {sketchUrls.length > 0 && (
          <div className="sketch-preview mt-4">
            <h5>Pencil Sketches:</h5>
            <div className="preview-grid">
              {sketchUrls.map((url, index) => (
                <div key={index} className="sketch-item">
                  <img src={url} alt={`Sketch ${index}`} className="img-thumbnail" />
                  <a
                    href={url}
                    download={`sketch-${index + 1}.jpg`}
                    className="btn btn-success mt-2"
                  >
                    Download Sketch
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {animeUrls.length > 0 && (
          <div className="anime-preview mt-4">
            <h5>Anime Images:</h5>
            <div className="preview-grid">
              {animeUrls.map((url, index) => (
                <div key={index} className="anime-item">
                  <img src={url} alt={`Anime ${index}`} className="img-thumbnail" />
                  <a
                    href={url}
                    download={`anime-${index + 1}.jpg`}
                    className="btn btn-success mt-2"
                  >
                    Download Anime
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>
      <section className="gallery">
        <div className="gallery-item">
          <img src={girl} alt="girl" />
        </div>
        <div className="gallery-item">
          <img src={sketch1} alt="Sketch 1" />
        </div>
        <div className="gallery-item">
          <img src={mice} alt="mice" />
        </div>
        <div className="gallery-item">
          <img src={sketch2} alt="Sketch 2" />
        </div>
      </section>
    </div>
  );
}

export default App;
