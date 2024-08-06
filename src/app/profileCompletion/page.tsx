'use client';
import { useState, useEffect } from 'react';
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
import ImageUpload from '../../components/ImageUpload'
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
  images: File[];
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
    images: [] as File[],
  });

  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');
  const router = useRouter()
  const [date, setDate] = useState<Date>()
  const [errors, setErrors] = useState<{ [key: string]: string }>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    bio: '',
    localAddress: '',
    city: '',
    state: '',
    country: '',
    images: '',
  });


  const handleImageChange = (event: any) => {

    setFormData(prevState => ({
      ...prevState,
      images: [...prevState.images, event]
    }));
    setErrors((prevErrors) => ({ ...prevErrors, images: '' }));
  };
  const handleImageRemove = (id: number) => {
    setFormData(prevState => {
      if (id === 1) {
        // Remove the first image if id is 1
        return {
          ...prevState,
          images: prevState.images.slice(1) // Removes the first image
        };
      } else if (id === 2) {
        // Remove the second image if id is 2
        return {
          ...prevState,
          images: [
            ...prevState.images.slice(0, 1), // Keep the first image
            ...prevState.images.slice(2)    // Remove the second image (index 1) and keep the rest
          ]
        };
      }
      // Return state unmodified if id is not 1 or 2
      return prevState;
    });
  };

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
              city:
                locationData.address_components.find((comp: any) => comp.types.includes('locality'))?.long_name || '',
              state:
                locationData.address_components.find((comp: any) => comp.types.includes('administrative_area_level_1'))
                  ?.long_name || '',
              country:
                locationData.address_components.find((comp: any) => comp.types.includes('country'))?.long_name || '',
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

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const handleDateChange = (newDate: any) => {
    const offsetDate = new Date(newDate.getTime() - (newDate.getTimezoneOffset() * 60000));

    setDate(offsetDate);
    setFormData((prevState) => ({
      ...prevState,
      dateOfBirth: offsetDate.toISOString(),
    }));
    setErrors((prevErrors) => ({ ...prevErrors, dateOfBirth: '' }));
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
    if (formData.images.length < 2) {
      validationErrors.images = 'At least 2 images are required';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
      return;
    }

    try {
      console.log("FormData before submission:", formData);

      const imageData = formData.images?.map(file => ({
        filename: file.name,
        contentType: file.type
      })) || [];

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
          const file = formData.images?.[i];

          if (!file) {
            console.error(`No file found for index ${i}`);
            continue;
          }

          console.log(`Preparing to upload file: ${file.name}`);

          let formData_new = new FormData();
          Object.entries(uploadData.fields).forEach(([key, value]) => {
            formData_new.append(key, value as string);
          });
          formData_new.append('file', file);

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
    <div className="mt-3 p-6 max-w-md mx-auto bg-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-semibold mb-4">Complete Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
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



        < ImageUpload handleImageChange={handleImageChange} handleImageRemove={handleImageRemove} id={1} key="upload1" />
        < ImageUpload handleImageChange={handleImageChange} handleImageRemove={handleImageRemove} id={2} key="upload2" />

        {locationError && <p className="text-red-500">{locationError}</p>}
        <Button type="submit" className="w-full bg-pink-700 text-white hover:bg-pink-700">
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </div>
  );
}