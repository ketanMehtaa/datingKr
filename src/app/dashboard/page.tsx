'use client';
// pages/index.tsx
import Head from 'next/head';
import Image from 'next/image';
import { useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import axios from 'axios';
import { useEffect, useCallback } from 'react';


interface Profile {
  id: number;
  name: string;
  age: number;
  image: string;
}

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([
    {
      id: 1,
      name: 'John Doe',
      age: 25,
      image: 'https://photosnow.org/wp-content/uploads/2024/04/beautiful-girl-photo_13.jpg',
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 28,
      image: 'https://photosnow.org/wp-content/uploads/2024/04/indian-girl-photo_15.jpg',
    },
    {
      id: 1,
      name: 'John Doe',
      age: 25,
      image: 'https://photosnow.org/wp-content/uploads/2024/04/beautiful-girl-photo_13.jpg',
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 28,
      image: 'https://photosnow.org/wp-content/uploads/2024/04/indian-girl-photo_15.jpg',
    },

    {
      id: 1,
      name: 'John Doe',
      age: 25,
      image: 'https://photosnow.org/wp-content/uploads/2024/04/beautiful-girl-photo_13.jpg',
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 28,
      image: 'https://photosnow.org/wp-content/uploads/2024/04/indian-girl-photo_15.jpg',
    },

    {
      id: 1,
      name: 'John Doe',
      age: 25,
      image: 'https://photosnow.org/wp-content/uploads/2024/04/beautiful-girl-photo_13.jpg',
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 28,
      image: 'https://photosnow.org/wp-content/uploads/2024/04/indian-girl-photo_15.jpg',
    },

    {
      id: 1,
      name: 'John Doe',
      age: 25,
      image: 'https://photosnow.org/wp-content/uploads/2024/04/beautiful-girl-photo_13.jpg',
    },
    {
      id: 2,
      name: 'Jane Smith',
      age: 28,
      image: 'https://photosnow.org/wp-content/uploads/2024/04/indian-girl-photo_15.jpg',
    },
  ]);
  
  useEffect(() => {
    // Define the async function
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/recommendation', {
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('Response data:', response.data);
        // setData(response.data); // Set the response data to state
      } catch (err) {
        console.error('Error fetching data:', err);
        // setError(err.message); // Set error message to state
      } finally {
        // setLoading(false); // Set loading to false once data is fetched or an error occurs
      }
    };

    // Call the async function
    fetchData();
  }, []); // Empty dependency array means this effect runs once after initial render

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
        {/* Header */}
        <header className="fixed top-0 left-0 w-full bg-white shadow-md p-4 z-10">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Dating App</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow pt-20 pb-16 flex justify-center items-center">
          {profiles.length > 0 && (
            <motion.div
              animate={controls}
              className="relative w-full max-w-sm bg-white p-4 rounded-lg shadow-lg"
              drag="x"
              dragConstraints={{ left: -300, right: 300 }}
              dragElastic={0.1}
              onDragEnd={(event, info) => {
                const swipeThreshold = 150; // Minimum distance for swipe to be considered valid
                const swipeVelocityThreshold = 500; // Minimum velocity for swipe to be considered valid
                const distance = Math.abs(info.offset.x);
                const velocity = info.velocity.x;

                if (distance > swipeThreshold && velocity > swipeVelocityThreshold) {
                  handleSwipe(info.offset.x > 0 ? 'right' : 'left');
                } else {
                  controls.start({ x: 0, opacity: 1 });
                }
              }}
            >

              <Image
                src={profiles[0].image}
                alt="Profile Picture"
                width={400}
                height={400}
                className="w-full h-64 object-cover rounded-t-lg"
              />
              <div className="p-4">
                <h2 className="text-xl font-semibold">{profiles[0].name}</h2>
                <p className="text-gray-600">{profiles[0].age} years old, loves hiking and photography.</p>
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

        {/* Footer */}
        <footer className="fixed bottom-0 left-0 w-full bg-white shadow-md p-4 text-center">
          <div className="container mx-auto">
            <p className="text-gray-600">© 2024 Dating App. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </>
  );
}


