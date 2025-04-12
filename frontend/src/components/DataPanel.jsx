import React from "react";

const DataPanel = ({ predictions }) => {
  return (
    <div className="p-4 rounded w-full dark:text-white">
      <h2 className="text-2xl font-semibold mb-2 px-4">Estimated Weight</h2>
      <div className="flex mb-2 items-center">
        <span className="w-1/2 p-4">Pig #</span>
        <span className="w-1/2 p-4">Weight</span>
      </div>
      {predictions.length === 0 ? (
        <p className="text-center p-4 border-t">No data available</p>
      ) : (
        <div>
          <ul>
            {predictions.map((pred, index) => (
              <li key={index} className="flex mb-1 border-t">
                <span className="w-1/2 p-4">{index + 1}</span>
                <span className="w-1/2 p-4">{pred.weight} kg</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DataPanel;
