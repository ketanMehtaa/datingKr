'use client';
import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';
// import useDebounce from '../../components/useDebounce'
import { useRouter } from 'next/navigation'

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

function toNumberString(num: number) {
  if (Number.isInteger(num)) {
    return num + '.0';
  } else {
    return num.toString();
  }
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
  const [suggestions, setSuggestions] = useState([]);
  const router = useRouter()

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);
      setFormData(prevState => ({
        ...prevState,
        images: filesArray
      }));
    }
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

            // setFormData((prevState) => ({
            //   ...prevState,
            //   latitude,
            //   longitude,
            //   localAddress: locationData.formatted_address || '',
            //   city: locationData.address_components.find((comp) => comp.types.includes('locality'))?.long_name || '',
            //   state:
            //     locationData.address_components.find((comp) => comp.types.includes('administrative_area_level_1'))
            //       ?.long_name || '',
            //   country: locationData.address_components.find((comp) => comp.types.includes('country'))?.long_name || '',
            // }));
            setFormData((prevState: FormData) => ({
              ...prevState,
              // todo uncommment latitude and longitude
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

  // useEffect(() => {
  //   if (debouncedSearch) {
  //     fetch(`/api/search?q=${debouncedSearch}`)
  //   }
  // }, [debouncedSearch])
  // return <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} />

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setFormData((prevState) => ({
        ...prevState,
        images: [...prevState.images, ...newImages],
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
  
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
          // Handle this error case (e.g., show an error message to the user)
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
            // Handle error (e.g., show message to user)
          }
        }
  
        console.log('All uploads completed, redirecting to dashboard');
        router.push('/dashboard');
      } else {
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      // Handle error (e.g., show an error message to the user)
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
          // label="First Name"
          type="text"
          placeholder="Enter your first name"
          value={formData.firstName}
          onChange={handleChange}
          required
          className="w-full"
        />
        <Input
          name="lastName"
          // label="Last Name"
          type="text"
          placeholder="Enter your last name"
          value={formData.lastName}
          onChange={handleChange}
          required
          className="w-full"
        />
        <Input
          name="dateOfBirth"
          // label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required
          className="w-full"
        />
        {/* todo required not working in gender */}
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
        <Textarea
          name="bio"
          placeholder="Write something about yourself"
          value={formData.bio}
          onChange={handleChange}
          className="w-full"
        />
        {/* <Input
          name="profilePicture"
          type="url"
          placeholder="Enter profile picture URL"
          value={formData.profilePicture}
          onChange={handleChange}
          className="w-full"
        /> */}
        <Input
          name="localAddress"
          type="text"
          placeholder="Local Address"
          value={formData.localAddress}
          onChange={handleChange}
          className="w-full"
          required
        />
        {/* <div className="relative">
          <Input
            name="localAddress"
            type="text"
            placeholder="Local Address"
            value={formData.localAddress}
            onChange={handleChange}
            className="w-full"
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white border border-gray-300 mt-1 rounded-md shadow-lg">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionSelect(suggestion)}
                >
                  {suggestion?.formatted_address}
                </li>
              ))}
            </ul>
          )}
        </div> */}

        <Input
          name="city"
          type="text"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          className="w-full"
          required
        />
        <Input
          name="state"
          type="text"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
          className="w-full"
          required
        />
        <Input
          name="country"
          type="text"
          placeholder="Country"
          value={formData.country}
          onChange={handleChange}
          className="w-full"
          required
        />
        <div>
          <label htmlFor="image-upload" className="block text-sm font-medium text-gray-700">
            Upload Profile Pictures
          </label>
          {/* <input
            id="image-upload" 
            name="images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-1 block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-violet-50 file:text-violet-700
              hover:file:bg-violet-100"
          /> */}
          <input
            type="file"
            multiple
            onChange={handleImageChange}
            accept="image/*"
          />

        </div>
        {locationError && <p className="text-red-500">{locationError}</p>}
        <Button type="submit" className="w-full bg-pink-700 text-white hover:bg-pink-700">
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </div>
  );
}
