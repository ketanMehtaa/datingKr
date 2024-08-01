'use client';
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import axios from 'axios';

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
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    bio: '',
    profilePicture: '',
    localAdress: '',
    city: '',
    state: '',
    country: '',
    latitude: '',
    longitude: '',
  });
  const [loading, setLoading] = useState(false);
  const [locationError, setLocationError] = useState('');

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

            setFormData((prevState) => ({
              ...prevState,
              latitude,
              longitude,
              localAdress: locationData.formatted_address || '',
              city: locationData.address_components.find(comp => comp.types.includes('locality'))?.long_name || '',
              state: locationData.address_components.find(comp => comp.types.includes('administrative_area_level_1'))?.long_name || '',
              country: locationData.address_components.find(comp => comp.types.includes('country'))?.long_name || '',
            }));
          } catch (error) {
            console.error('Error fetching reverse geocode data:', error);
            setLocationError('Error fetching location data.');
          }
        },
        (error) => {
          setLocationError('Unable to retrieve location. Please make sure location services are enabled and try again.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by this browser.');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const resProfile = await fetch('/api/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (resProfile.ok) {
        // Handle success
        console.log('Profile updated successfully');
      } else {
        // Handle error
        console.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-semibold mb-4">Complete Your Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          name="firstName"
          label="First Name"
          type="text"
          placeholder="Enter your first name"
          value={formData.firstName}
          onChange={handleChange}
          required
          className="w-full"
        />
        <Input
          name="lastName"
          label="Last Name"
          type="text"
          placeholder="Enter your last name"
          value={formData.lastName}
          onChange={handleChange}
          required
          className="w-full"
        />
        <Input
          name="dateOfBirth"
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={handleChange}
          required
          className="w-full"
        />
        <Select
          name="gender"
          value={formData.gender}
          onValueChange={(value) => setFormData({ ...formData, gender: value })}
          required
          className="w-full"
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select Gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="MALE">Male</SelectItem>
            <SelectItem value="FEMALE">Female</SelectItem>
            {/* Add more options if needed */}
          </SelectContent>
        </Select>
        <Textarea
          name="bio"
          label="Bio"
          placeholder="Write something about yourself"
          value={formData.bio}
          onChange={handleChange}
          className="w-full"
        />
        <Input
          name="profilePicture"
          label="Profile Picture URL"
          type="url"
          placeholder="Enter profile picture URL"
          value={formData.profilePicture}
          onChange={handleChange}
          className="w-full"
        />
        <Input
          name="localAdress"
          label="Local Address"
          type="text"
          placeholder="Local Address"
          value={formData.localAdress}
          onChange={handleChange}
          className="w-full"
        />
        <Input
          name="city"
          label="City"
          type="text"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          className="w-full"
        />
        <Input
          name="state"
          label="State"
          type="text"
          placeholder="State"
          value={formData.state}
          onChange={handleChange}
          className="w-full"
        />
        <Input
          name="country"
          label="Country"
          type="text"
          placeholder="Country"
          value={formData.country}
          onChange={handleChange}
          className="w-full"
        />
        {locationError && <p className="text-red-500">{locationError}</p>}
        <Button type="submit" className="w-full bg-blue-500 text-white hover:bg-blue-600">
          {loading ? 'Saving...' : 'Save'}
        </Button>
      </form>
    </div>
  );
}