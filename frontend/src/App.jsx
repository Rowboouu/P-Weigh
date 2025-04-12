import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import VideoDisplay from "./components/VideoDisplay";
import DataPanel from "./components/DataPanel";
import Description from "./components/Description";
import Reminder from "./components/Reminder";
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
      <div className="min-h-screen bg-white dark:bg-gray-800">
        <Header />
        <main className="container mx-auto py-12 lg:px-28 px-4 flex flex-col gap-6 items-center">
          <Description />
          <Reminder />
          <div className="flex flex-col md:grid md:grid-cols-4 gap-4 mb-8 w-full">
            <div className="col-span-3">
              <VideoDisplay predictions={predictions} />
            </div>
            <div className="col-span-1">
              <DataPanel predictions={predictions} />
            </div>
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
};

export default App;
