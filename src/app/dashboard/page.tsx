'use client'
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import axios from 'axios';

interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  profilePicture: string;
  city: string;
  state: string;
  country: string;
  distance: number;
}

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/recommendation', {
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('Response data:', response.data);
        setProfiles(response.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const controls = useAnimation();

  const handleSwipe = (direction: 'left' | 'right') => {
    controls
      .start({
        x: direction === 'left' ? -1000 : 1000,
        opacity: 0,
        transition: { duration: 0.5 },
      })
      .then(() => {
        setProfiles((prev) => prev.slice(1));
        controls.set({ x: 0, opacity: 1 });
      });
  };

  return (
    <>
      <Head>
        <title>Dating App</title>
        <meta name="description" content="Dating app home page" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </Head>

      <div className="flex flex-col min-h-screen bg-gray-100">
        <header className="fixed top-0 left-0 w-full bg-white shadow-md p-4 z-10">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Dating App</h1>
          </div>
        </header>

        <main className="flex-grow pt-20 pb-16 flex justify-center items-center">
          {profiles.length > 0 && (
            <motion.div
              animate={controls}
              className="relative w-full max-w-sm bg-white p-4 rounded-lg shadow-lg"
              drag="x"
              dragConstraints={{ left: -300, right: 300 }}
              dragElastic={0.1}
              onDragEnd={(event, info) => {
                const swipeThreshold = 150;
                const swipeVelocityThreshold = 500;
                const distance = Math.abs(info.offset.x);
                const velocity = info.velocity.x;

                if (distance > swipeThreshold && velocity > swipeVelocityThreshold) {
                  handleSwipe(info.offset.x > 0 ? 'right' : 'left');
                } else {
                  controls.start({ x: 0, opacity: 1 });
                }
              }}
            >
              <img
                src={profiles[0].profilePicture}
                alt="Profile Picture"
                width={400}
                height={400}
                className="w-full h-64 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold">{profiles[0].firstName} {profiles[0].lastName}</h2>
                <p className="text-gray-600">{profiles[0].city}, {profiles[0].state}, {profiles[0].country}</p>
                <p className="text-gray-600">Distance: {profiles[0].distance.toFixed(2)} km</p>
              </div>
              <div className="absolute inset-x-0 bottom-4 flex justify-between px-4">
                <button
                  className="bg-red-500 text-white p-2 rounded-full shadow-md"
                  onClick={() => handleSwipe('left')}
                >
                  <span className="material-icons">close</span>
                </button>
                <button
                  className="bg-green-500 text-white p-2 rounded-full shadow-md"
                  onClick={() => handleSwipe('right')}
                >
                  <span className="material-icons">check</span>
                </button>
              </div>
            </motion.div>
          )}
        </main>

        <footer className="fixed bottom-0 left-0 w-full bg-white shadow-md p-4 text-center">
          <div className="container mx-auto">
            <p className="text-gray-600">© 2024 Dating App. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}
