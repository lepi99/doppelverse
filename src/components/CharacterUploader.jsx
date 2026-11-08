// src/components/CharacterUploader.js
import React, { useState } from 'react';
import { db, storage } from '../firebaseConfig'; // Adjust the import path
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function CharacterUploader() {
  const [name, setName] = useState('');
  const [type, setType] = useState('Human'); // Default value
  const [photo, setPhoto] = useState(null);
  const [photoCredit, setPhotoCredit] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setPhoto(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !photo) {
      setError('Name and photo are required.');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccessMessage('');

    try {
      // 1. Upload photo to Firebase Storage
      const photoRef = ref(storage, `images/${type.toLowerCase()}/${photo.name}`);
      const uploadResult = await uploadBytes(photoRef, photo);
      const photoURL = await getDownloadURL(uploadResult.ref);

      // 2. Save character data to Firestore
      // For this example, we'll add to a 'characters' collection.
      // You can choose to add to 'humans' or 'animals' based on the type.
      const docRef = await addDoc(collection(db, "characters"), {
        name: name,
        type: type,
        photo: photoURL, // Use the URL from Storage
        photo_credit: photoCredit,
        features: {
          // You can expand this to collect feature data from the form
        }
      });

      setSuccessMessage(`Successfully uploaded ${name}! Document ID: ${docRef.id}`);
      
      // Reset form
      setName('');
      setType('Human');
      setPhoto(null);
      setPhotoCredit('');
      e.target.reset();

    } catch (err) {
      setError(`Upload failed: ${err.message}`);
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '500px', margin: 'auto' }}>
      <h2>Upload New Character</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px' }}>
          <label>Name:</label><br />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Type:</label><br />
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ width: '100%', padding: '8px' }}>
            <option value="Human">Human</option>
            <option value="Cartoon">Cartoon</option>
            <option value="Dog Breed">Dog Breed</option>
            <option value="Cat Breed">Cat Breed</option>
            <option value="Dinosaur">Dinosaur</option>
            <option value="Other Animals">Other Animals</option>
            {/* Add other types as needed */}
          </select>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Photo:</label><br />
          <input
            type="file"
            onChange={handleFileChange}
            accept="image/png, image/jpeg, image/jpg"
            required
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <label>Photo Credit:</label><br />
          <input
            type="text"
            value={photoCredit}
            onChange={(e) => setPhotoCredit(e.target.value)}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <button type="submit" disabled={isUploading} style={{ padding: '10px 15px' }}>
          {isUploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default CharacterUploader;
