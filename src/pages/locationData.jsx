import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
export default function LocationData() {
  // State Hooks
  const [time, setTime] = useState(new Date().toISOString().slice(11, 16)); // Default to current time
  const [passengerCount, setPassengerCount] = useState(1); // Default passenger count to 1
  const [isDay, setIsDay] = useState(true); // Default to "Day"
  const [isHostelPickup, setIsHostelPickup] = useState(false); // Default to no hostel pickup
  const [pickupLocation, setPickupLocation] = useState(null); // Store selected pickup location
  const [dropLocation, setDropLocation] = useState(null); // Store selected drop location
  const [loading, setLoading] = useState(false); // Loading state for API call
  const [fareData, setFareData] = useState(null); // Store fetched fare data
  const [locations, setLocations] = useState([]); // Store fetched locations from options.json

  // Fetch locations on component mount
  useEffect(() => {
    fetch('/options.json')
      .then((response) => response.json())
      .then((data) => setLocations(data.options))
      .catch((error) => console.error('Error loading JSON:', error));
  }, []);

  // Custom styles for the Select component
  const customStyles = {
    input: (base) => ({
      ...base,
      textDecoration: 'none',
      fontWeight: '600',
      color: 'white',
      fontSize: '14px',
      padding: '12px',
    }),
    control: (base) => ({
      ...base,
      color: 'white',
      backgroundColor: '#006EFF',
      border: '1px solid transparent',
      borderRadius: '8px',
      boxShadow: 'none',
      '&:hover': {
        borderColor: 'transparent',
      },
    }),
    placeholder: (base) => ({
      ...base,
      fontSize: '14px',
      color: 'white',
      fontStyle: 'bold',
    }),
    singleValue: (base) => ({
      ...base,
      fontSize: '14px',
      color: 'white',
      fontWeight: 'bold',
    }),
  };

  // Handle fare check when locations are selected
  const handleCheckFare = async () => {
    if (!pickupLocation || !dropLocation) {
      alert('Please select both pickup and drop locations.');
      return;
    }

    setLoading(true); // Start loading
    setFareData(null); // Reset fare data

    const apiURL = `https://automateapi.vercel.app/v1/fare/pickup=${
      pickupLocation.value
    }/drop=${
      dropLocation.value
    }/passengers=${passengerCount}/time=${time}/advancebooking=false/date=${
      new Date().toISOString().split('T')[0]
    }/night=${!isDay}/noofautosrequired=1/fromhostel=${isHostelPickup}`;

    try {
      const response = await fetch(apiURL);
      if (!response.ok) {
        throw new Error('Failed to fetch fare details');
      }
      const data = await response.json();
      console.log(data);
      setFareData(data); // Store the fetched data
    } catch (error) {
      console.error(error);
      alert('Error fetching fare details. Please try again later.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <div className="bookingpage">
      {/* Booking Header */}
      <div className="bookinghead">Book A Ride</div>

      {/* Pickup and Drop Location Selection */}
      <div className="locationdiv">
        {/* Pickup Location */}
        <div className="pickuplocation">
          <img src="/pin.png" alt="location icon" className="firsticon" />
          <Select
            options={locations} // Use the fetched locations
            value={pickupLocation}
            onChange={(selected) => setPickupLocation(selected)}
            placeholder="Search Pickup"
            isClearable
            isSearchable
            className="selectinput"
            styles={customStyles}
          />
        </div>

        <div className="seperator"></div>

        {/* Drop Location */}
        <div className="droplocation">
          <img src="/pin.png" alt="location icon" className="firsticon" />
          <Select
            options={locations} // Use the fetched locations
            value={dropLocation}
            onChange={(selected) => setDropLocation(selected)}
            placeholder="Search Drop"
            isClearable
            isSearchable
            className="selectinput"
            styles={customStyles}
          />
        </div>
      </div>

      {/* Passenger Count and Day/Night Toggle */}
      <div className="seconddivpass">
        <div className="passengers">
          <div className="tagpass">No Of Passengers</div>
          <div className="passengercount">{passengerCount}</div>
          <div className="buttonspassengers">
            <div
              className="decreasebuttonpass"
              onClick={() =>
                passengerCount > 1 && setPassengerCount(passengerCount - 1)
              }
            >
              -
            </div>
            <div
              className="increasebuttonpass"
              onClick={() =>
                passengerCount < 5 && setPassengerCount(passengerCount + 1)
              }
            >
              +
            </div>
          </div>
        </div>

        {/* Day/Night Toggle */}
        <div
          className={`dayornight ${isDay ? 'day' : 'night'}`} // Apply different background based on state
          onClick={() => setIsDay(!isDay)}
        >
          <div className="tagdayornight">{isDay ? 'Day' : 'Night'}</div>
          <div className="descdayornight">
            {isDay ? 'From 7AM to 11PM' : 'From 11PM to 7AM'}
          </div>
          <img
            src={isDay ? '/sun.png' : '/moon.png'} // Change image source based on state
            alt={isDay ? 'Sun' : 'Moon'}
            className="imgdayornight"
          />
        </div>
      </div>

      {/* Ride Time and Hostel Pickup */}
      <div className="seconddivpass">
        {/* Ride Time */}
        <div className="ridetime">
          <div className="tagridetime">Ride Time</div>
          <img src="/clock-blue.png" alt="Clock" className="ridetimeimg" />
          <input
            type="time"
            className="ridetimeinput"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        {/* Pickup From Hostel */}
        <div className="fromhostel">
          <div className="tagridetime">Pickup From Hostel</div>
          <img src="/hostel.png" alt="Clock" className="ridetimeimg" />
          <label className="switch">
            <input
              type="checkbox"
              checked={isHostelPickup}
              onChange={() => setIsHostelPickup(!isHostelPickup)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      {/* Booking Summary and Fare Check */}
      {(pickupLocation || dropLocation) && (
        <div className="bookingsummary">
          <div className="firstsummary">
            <div className="from">
              <div className="circle"></div>
              From: {pickupLocation ? pickupLocation.label : 'Not Selected'}
            </div>
            <div className="to">
              <div className="circle"></div>
              To: {dropLocation ? dropLocation.label : 'Not Selected'}
            </div>
          </div>
          <div className="secondsummary">
            <div className="checkfarebutton" onClick={handleCheckFare}>
              {loading ? <span className="loader"></span> : 'Check Fare'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
