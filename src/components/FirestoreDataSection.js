import React from 'react';
import './FirestoreDataSection.css';

const FirestoreDataSection = ({ data }) => {
  return (
    <section className="firestore-data">
      <h2>Data Section</h2>
      {data && (
        <div className="data-container">
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </section>
  );
};

export { FirestoreDataSection };
export default FirestoreDataSection;