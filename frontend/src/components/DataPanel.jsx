import React from "react";

const DataPanel = ({ predictions }) => {
  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded">
      <h2 className="text-lg font-semibold mb-2">Pig Weight Data</h2>
      {predictions.length === 0 ? (
        <p>No data available</p>
      ) : (
        <ul>
          {predictions.map((pred, index) => (
            <li key={index} className="mb-1">
              Pig {index + 1}: {pred.weight} kg
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DataPanel;
