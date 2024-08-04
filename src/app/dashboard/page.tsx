'use client'
import Head from 'next/head';
import { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
import axios from 'axios';
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import debounce from 'lodash/debounce';
interface Profile {
  id: string;
  firstName: string;
  lastName: string;
  photos: { url: string }[];
  city: string;
  state: string;
  country: string;
  distance: number;
}


type SliderProps = React.ComponentProps<typeof Slider>

export default function Home() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [value, setValue] = useState([5]);


  // useEffect(() => {
  //   const fetchData = async () => {
  //     try {
  //       const response = await axios.get('/api/recommendation', {
  //         headers: { 'Content-Type': 'application/json' },
  //         params: { maxDistance: value[0] * 1000 }
  //       });
  //       console.log('Response data:', response.data);
  //       setProfiles(response.data);
  //     } catch (err) {
  //       console.error('Error fetching data:', err);
  //     }
  //   };

  //   fetchData();
  // }, [value[0]]);
  const fetchData = useCallback(async (distance: number) => {
    try {
      const response = await axios.get('/api/recommendation', {
        headers: { 'Content-Type': 'application/json' },
        params: { maxDistance: distance * 1000 }
      });
      console.log('Response data:', response.data);
      setProfiles(response.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  }, []);

  const debouncedFetchData = useCallback(
    debounce((distance: number) => fetchData(distance), 1000),
    [fetchData]
  );

  useEffect(() => {
    debouncedFetchData(value[0]);
  }, [value[0], debouncedFetchData]);


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

  const currentProfile = profiles[0];

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
        <div className="flex flex-col items-center mt-20">
          <Slider
            min={0}
            max={3000}
            step={0.1}
            className={cn("w-[60%]")}
            value={value}
            onValueChange={(newValue) => setValue(newValue)}
          />
          <p className="mt-2">
            {value[0]} km
          </p>
        </div>

        <main className="flex-grow pt-20 pb-16 flex justify-center items-center">
          {currentProfile && (
            <motion.div
              animate={controls}
              className="relative w-full max-w-md bg-white p-4 rounded-lg shadow-lg"
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
              <div className="p-4">
                {/* User Info */}
                <h2 className="text-xl font-semibold">{currentProfile?.firstName} {currentProfile?.lastName}</h2>
                <p className="text-gray-600">{currentProfile?.city}, {currentProfile?.state}, {currentProfile?.country}</p>
                <p className="text-gray-600">Distance: {(currentProfile?.distance / 1000).toFixed(2)} km</p>
              </div>

              {/* Horizontal Scrolling Photos */}
              <div className="relative">
                {currentProfile?.photos?.length > 0 && (
                  <div className="overflow-x-auto whitespace-nowrap">
                    {currentProfile.photos.map((photo, index) => (
                      <img
                        key={index}
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        className="inline-block w-64 h-64 object-cover rounded-lg mx-2"
                      />
                    ))}
                  </div>
                )}
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
