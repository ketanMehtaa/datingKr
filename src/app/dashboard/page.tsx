'use client'
import Head from 'next/head';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, useAnimation } from 'framer-motion';
import axios from 'axios';
import { cn } from "@/lib/utils"
import { Slider } from "@/components/ui/slider"
import debounce from 'lodash/debounce';
import Image from "next/legacy/image";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCheck } from '@fortawesome/free-solid-svg-icons';

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

  const nextProfileRef = useRef<HTMLDivElement>(null);

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
        rotate: direction === 'left' ? -10 : 10,
        transition: { duration: 0.5 },
      })
      .then(() => {
        setProfiles((prev) => prev.slice(1));
        controls.set({ x: 0, opacity: 1, rotate: 0 });
      });
  };

  const currentProfile = profiles[0];
  const nextProfile = profiles[1];

  return (
    <>
      <div className="flex flex-col min-h-screen bg-gray-100">
        <header className="w-full bg-white shadow-md p-4 z-10">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold">Hamy</h1>
          </div>
        </header>
        <div className="flex flex-col items-center">
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

        <main className="flex-grow pb-16 flex justify-center items-center">
          {currentProfile && (
            <motion.div
              animate={controls}
              className="relative w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden"
              drag="x"
              dragConstraints={{ left: -300, right: 300 }}
              dragElastic={0.1}
              whileDrag={{ rotate: 5 }}
              onDragEnd={(event, info) => {
                const swipeThreshold = 150;
                const swipeVelocityThreshold = 500;
                const distance = Math.abs(info.offset.x);
                const velocity = Math.abs(info.velocity.x);

                if (distance > swipeThreshold && velocity > swipeVelocityThreshold) {
                  handleSwipe(info.offset.x > 0 ? 'right' : 'left');
                } else {
                  controls.start({ x: 0, opacity: 1, rotate: 0 });
                }
              }}
            >
              <div className="relative flex flex-col">
                {currentProfile?.photos?.length > 0 && (
                  currentProfile.photos.map((photo, index) => (
                    <div key={index} className="relative w-full h-auto p-4 rounded-lg">
                      <Image
                        src={photo.url}
                        alt={`Photo ${index + 1}`}
                        layout="responsive"
                        width={1200}
                        height={800}
                        objectFit="cover"
                        className='rounded-lg'
                        priority={index === 0}
                      />
                    </div>
                  ))
                )}
              </div>
              <div className="relative h-14 flex flex-col">
                {/* Fixed Profile Information */}
                <div className="fixed inset-x-0 bottom-4 flex flex-col items-center p-4 bg-white shadow-md">
                  <h2 className="text-xl font-semibold">{currentProfile?.firstName} {currentProfile?.lastName}</h2>
                  <p className="text-gray-600 text-center">
                    {currentProfile?.city}, {currentProfile?.state}, {currentProfile?.country}
                  </p>
                  <p className="text-gray-600 text-center">
                    Distance: {(currentProfile?.distance / 1000).toFixed(2)} km
                  </p>
                </div>

                {/* Fixed Swipe Buttons */}
                <div className="fixed inset-x-0 bottom-10 flex justify-between px-4">
                  <button
                    className="bg-red-500 text-white p-3 rounded-full shadow-md flex items-center justify-center"
                    onClick={() => handleSwipe('left')}
                  >
                    <FontAwesomeIcon icon={faTimes} />
                  </button>
                  <button
                    className="bg-green-500 text-white p-3 rounded-full shadow-md flex items-center justify-center"
                    onClick={() => handleSwipe('right')}
                  >
                    <FontAwesomeIcon icon={faCheck} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Preload next profile */}
          {nextProfile && (
            <div className="hidden">
              {nextProfile.photos?.map((photo, index) => (
                <Image
                  key={index}
                  src={photo.url}
                  alt={`Next Profile Photo ${index + 1}`}
                  width={1200}
                  height={800}
                  priority
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}