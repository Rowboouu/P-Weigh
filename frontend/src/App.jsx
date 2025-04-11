import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import VideoDisplay from "./components/VideoDisplay";
import DataPanel from "./components/DataPanel";
import Description from "./components/Description";
import { ThemeProvider } from "./context/ThemeContext";

const App = () => {
  const [predictions, setPredictions] = useState([]);

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.predictions) {
        setPredictions(data.predictions);
      }
    };

    return () => ws.close();
  }, []);

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        <main className="container mx-auto p-4">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <VideoDisplay predictions={predictions} />
            <DataPanel predictions={predictions} />
          </div>
          <Description />
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;
