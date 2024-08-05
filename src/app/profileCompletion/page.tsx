'use client';
import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
import { useRouter } from 'next/navigation'
import { CalendarIcon } from "@radix-ui/react-icons"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

import Cropper from 'react-easy-crop';

interface FormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bio: string;
  localAddress: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  images: (File | string)[];
}

export default function CompleteProfileForm() {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    bio: '',
    localAddress: '',
    city: '',
    state: '',
    country: '',
    latitude: 0,
    longitude: 0,
    images: new Array(6).fill(null),
  });
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const router = useRouter();
  const [date, setDate] = useState<Date>();
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [currentImageIndex, setCurrentImageIndex] = useState<number | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  useEffect(() => {
    requestLocationPermission();
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          console.log('location', latitude, longitude);

          try {
            const res = await axios.put(
              `/api/autoComplete`,
              { latitude, longitude },
              { headers: { 'Content-Type': 'application/json' } }
            );

            const data = res.data;
            const locationData = data.results[0] || {};

            setFormData((prevState: FormData) => ({
              ...prevState,
              latitude,
              longitude,
              localAddress: locationData.formatted_address || '',
              city: locationData.address_components?.find((comp: any) => comp.types.includes('locality'))?.long_name || '',
              state: locationData.address_components?.find((comp: any) => comp.types.includes('administrative_area_level_1'))?.long_name || '',
              country: locationData.address_components?.find((comp: any) => comp.types.includes('country'))?.long_name || '',
            }));
          } catch (error) {
            console.error('Error fetching reverse geocode data:', error);
            setLocationError('Error fetching location data.');
          }
        },
        (error) => {
          setLocationError(
            'Unable to retrieve location. Please make sure location services are enabled and try again.'
          );
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      const offsetDate = new Date(newDate.getTime() - (newDate.getTimezoneOffset() * 60000));
      setDate(offsetDate);
      setFormData((prevState) => ({
        ...prevState,
        dateOfBirth: offsetDate.toISOString(),
      }));
      setErrors((prevErrors) => ({ ...prevErrors, dateOfBirth: '' }));
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prevState => {
          const newImages = [...prevState.images];
          newImages[index] = reader.result as string;
          return { ...prevState, images: newImages };
        });
        setCurrentImageIndex(index);
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const cropImage = useCallback(async () => {
    try {
      if (currentImageIndex !== null && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(formData.images[currentImageIndex] as string, croppedAreaPixels);
        setFormData((prevState:any) => {
          const newImages = [...prevState.images];
          newImages[currentImageIndex] = croppedImage;
          return { ...prevState, images: newImages };
        });
        setCurrentImageIndex(null);
      }
    } catch (e) {
      console.error(e);
    }
  }, [croppedAreaPixels, currentImageIndex, formData.images]);

  const removeImage = (index: number) => {
    setFormData((prevState:any) => {
      const newImages = [...prevState.images];
      newImages[index] = null;
      return { ...prevState, images: newImages };
    });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);

    const validationErrors: { [key: string]: string } = {};
    for (const key in formData) {
      if (key === 'images' || key === 'latitude' || key === 'longitude') {
        continue;
      }
      // @ts-ignore
      if (!formData[key]) {
        validationErrors[key] = `${key.charAt(0).toUpperCase() + key.slice(1)} is required`;
      }
    }
    if (formData.images.filter(image => image !== null).length < 2) {
      validationErrors.images = 'At least 2 images are required';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      console.log("FormData before submission:", formData);

      const imageData = formData.images.filter(image => image !== null).map(image => ({
        filename: image instanceof File ? image.name : 'unknown', // File or string, need to handle both
        contentType: image instanceof File ? image.type : 'image/jpeg' // File or string, need to handle both
      }));

      console.log("Image data prepared for submission:", imageData);

      const resProfile = await axios.post('/api/profileCompletion', {
        ...formData,
        images: imageData
      }, {
        headers: { 'Content-Type': 'application/json' },
      });

      console.log("Response from profileCompletion API:", resProfile.data);

      if (resProfile.status === 200) {
        const { imageUploadUrls } = resProfile.data;

        console.log("Received imageUploadUrls:", imageUploadUrls);

        if (!Array.isArray(imageUploadUrls) || imageUploadUrls.length === 0) {
          console.error("No valid imageUploadUrls received");
          return;
        }

        for (let i = 0; i < imageUploadUrls.length; i++) {
          const uploadData = imageUploadUrls[i];
          const file :any = formData.images[i];

          if (!file) {
            console.error(`No file found for index ${i}`);
            continue;
          }

          console.log(`Preparing to upload file: ${file?.name}`);

          let formData_new = new FormData();
          Object.entries(uploadData.fields).forEach(([key, value]) => {
            formData_new.append(key, value as string);
          });
          formData_new.append('file', file instanceof File ? file : new Blob([file], { type: 'image/jpeg' })); // Handle file or string

          try {
            const uploadResponse = await axios.post(uploadData.url, formData_new, {
              headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log(`Successfully uploaded image ${i + 1}`, uploadResponse.status);
          } catch (error) {
            console.error(`Failed to upload image ${i + 1}:`, error);
          }
        }

        console.log('All uploads completed, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl">
        <div className="md:flex">
          <div className="p-8 w-full">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Profile</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                name="firstName"
                type="text"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full"
              />
              {errors.firstName && <div className="text-red-500 text-sm mt-1">{errors.firstName}</div>}

              <Input
                name="lastName"
                type="text"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full"
              />
              {errors.lastName && <div className="text-red-500 text-sm mt-1">{errors.lastName}</div>}

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Date of Birth {formData.dateOfBirth}</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    required
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dateOfBirth && <div className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</div>}

              <Select
                name="gender"
                value={formData.gender}
                onValueChange={(value) => setFormData({ ...formData, gender: value })}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="NON_BINARY">Non Binary</SelectItem>
                  <SelectItem value="TRANSGENDER_MALE">Transgender Male</SelectItem>
                  <SelectItem value="TRANSGENDER_FEMALE">Transgender Female</SelectItem>
                  <SelectItem value="PREFER_NOT_TO_SAY">Prefer Not To Say</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && <div className="text-red-500 text-sm mt-1">{errors.gender}</div>}

              <Textarea
                name="bio"
                placeholder="Write something about yourself"
                value={formData.bio}
                onChange={handleChange}
                className="w-full"
              />
              {errors.bio && <div className="text-red-500 text-sm mt-1">{errors.bio}</div>}

              <Input
                name="localAddress"
                type="text"
                placeholder="Local Address"
                value={formData.localAddress}
                onChange={handleChange}
                className="w-full"
                required
              />
              {errors.localAddress && <div className="text-red-500 text-sm mt-1">{errors.localAddress}</div>}

              <Input
                name="city"
                type="text"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                className="w-full"
                required
              />
              {errors.city && <div className="text-red-500 text-sm mt-1">{errors.city}</div>}

              <Input
                name="state"
                type="text"
                placeholder="State"
                value={formData.state}
                onChange={handleChange}
                className="w-full"
                required
              />
              {errors.state && <div className="text-red-500 text-sm mt-1">{errors.state}</div>}

              <Input
                name="country"
                type="text"
                placeholder="Country"
                value={formData.country}
                onChange={handleChange}
                className="w-full"
                required
              />
              {errors.country && <div className="text-red-500 text-sm mt-1">{errors.country}</div>}

              <div>
                <label className="block text-sm font-medium text-gray-700">Profile Images</label>
                <div className="mt-2 grid grid-cols-3 gap-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      {image ? (
                        <>
                          <img
                            src={typeof image === 'string' ? image : URL.createObjectURL(image)}
                            alt={`Profile ${index + 1}`}
                            className="h-24 w-24 object-cover rounded-lg cursor-pointer"
                            onClick={() => setCurrentImageIndex(index)}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-0 right-0 -mt-2 -mr-2 bg-red-500 text-white rounded-full p-1"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </>
                      ) : (
                        <label className="h-24 w-24 flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
                          <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          <input type="file" className="hidden" onChange={(e) => handleImageChange(e, index)} accept="image/*" />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
                {errors.images && <p className="mt-2 text-sm text-red-600">{errors.images}</p>}
              </div>

              {locationError && <p className="text-red-500">{locationError}</p>}

              <Button
                type="submit"
                className="w-full bg-blue-600 text-white hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </form>
          </div>
        </div>
      </div >

      {currentImageIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-lg" style={{ width: '80%', height: '80%' }}>
            <div className="relative h-full">
              <Cropper
                image={formData.images[currentImageIndex] as string}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>
            <div className="mt-4 flex justify-between">
              <Button onClick={() => setCurrentImageIndex(null)} variant="outline">Cancel</Button>
              <Button onClick={cropImage} className="bg-blue-600 text-white hover:bg-blue-700">Crop and Save</Button>
            </div>
          </div>
        </div>
      )}
    </div >
  );
}

// Helper function for image cropping
async function getCroppedImg(imageSrc: string, pixelCrop: any) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        console.error('Canvas is empty');
        return;
      }
      resolve(URL.createObjectURL(blob));
    }, 'image/jpeg');
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });
}

function requestLocationPermission() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Latitude:', latitude, 'Longitude:', longitude);
      },
      (error) => {
        console.error('Error obtaining location:', error);
      }
    );
  } else {
    console.error('Geolocation is not supported by this browser.');
  }
}