import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

export default function BookingPage() {
  const navigate = useNavigate();
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
  const [index, setIndex] = useState(0);
  const [driverData, setDriverData] = useState(null);
  const [driverId, setDriverId] = useState(null);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [modalVisible, setModalVisible] = useState(false); // Modal state
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [bookingData, setBookingData] = useState(null);

  // Fetch locations on component mount
  useEffect(() => {
    fetch('/options.json')
      .then((response) => response.json())
      .then((data) => setLocations(data.options))
      .catch((error) => console.error('Error loading JSON:', error));
  }, []);

  useEffect(() => {
    // Check if user data is already stored
    const storedName = localStorage.getItem('username');
    const storedPhone = localStorage.getItem('phone');
    if (storedName && storedPhone) {
      setUserName(storedName);
      setUserPhone(storedPhone);
    }
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

  const getDrivers = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://automateapi.vercel.app/v1/drivers-info'
      );
      if (!response.ok) {
        throw new Error('Failed to fetch driver data');
      }
      const data = await response.json();
      setDriverData(data);
      console.log(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCheckFare = async () => {
    // Check if user data is in local storage
    const storedName = localStorage.getItem('username');
    const storedPhone = localStorage.getItem('phone');

    if (!storedName || !storedPhone) {
      // Show modal if user data is not available
      setModalVisible(true);
      return;
    }

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
      setFareData(data);
      getDrivers();
      setIndex(1); // Proceed to the next page
    } catch (error) {
      console.error(error);
      alert('Error fetching fare details. Please try again later.');
    } finally {
      setLoading(false); // Stop loading
    }
  };

  const handleSaveUserDetails = () => {
    if (!userName || !userPhone) {
      alert('Please enter both name and phone number.');
      return;
    }
    if (!/^\d{10}$/.test(userPhone)) {
      alert('Please enter a valid 10-digit phone number.');
      return;
    }

    // Save to localStorage
    localStorage.setItem('username', userName);
    localStorage.setItem('phone', userPhone);
    setModalVisible(false); // Close modal
  };

  const bookTheRide = async () => {
    if (!pickupLocation || !dropLocation || !selectedDriver) {
      alert('Please select pickup location, drop location, and a driver.');
      return;
    }

    const url = `https://automateapi.vercel.app/v1/book/pickup=${
      pickupLocation.value
    }/drop=${
      dropLocation.value
    }/passengers=${passengerCount}/time=${time}/advancebooking=false/date=${
      new Date().toISOString().split('T')[0]
    }/night=${!isDay}/noofautosrequired=1/fromhostel=${isHostelPickup}/driverid=${
      selectedDriver.id
    }/finalfare=${
      fareData.fare.split(' ')[0]
    }/passengername=${encodeURIComponent(
      localStorage.getItem('username')
    )}/passengerphone=${localStorage.getItem('phone')}`;

    setLoading(true);
    try {
      const response = await fetch(url, { method: 'GET' });
      if (!response.ok) {
        throw new Error('Failed to book the ride.');
      }

      const result = await response.json();
      setBookingData(result); // Save the result in state for further use
      // alert('Booking successful!');
      console.log(result);
      navigate('/book-ride/succesful', { state: { bookingDetails: result } });
      // Optionally, redirect to a success page or display confirmation details
    } catch (error) {
      console.error(error);
      alert('Error booking the ride. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bookingpage">
      {/* Booking Header */}
      <div className="bookinghead">
        {index === 1 || index === 2 ? (
          <img
            src="/back.png"
            alt="Back button"
            className="backbutton"
            onClick={() => setIndex(index - 1)}
          />
        ) : null}
        {index === 0 || index === 1 ? 'Book A Ride' : 'Summary'}
      </div>

      {index === 0 ? (
        <div className="index1">
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
          <div
            className="editpassengerbutton"
            onClick={() => setModalVisible(true)}
          >
            Edit User Information
          </div>
        </div>
      ) : index === 1 ? (
        <div className="index2">
          <div className="path"></div>
          <div className="driversList">
            <div className="selectdriverhead">Select Your Driver</div>
            {driverData &&
              driverData.drivers.map((driver) => (
                <div
                  className="drivertile"
                  key={driver.id}
                  onClick={() => setSelectedDriver(driver)} // Use function in onClick
                >
                  <div className="driverinfo">
                    <img
                      src={driver.image} // Dynamic image
                      alt="Driver"
                      className="driverimg"
                    />
                    <div className="driverinfodetails">
                      <div className="drivername">{driver.name}</div>
                      <div className="driverage">Age - {driver.age}</div>
                    </div>
                  </div>
                  <div className="driverbutton">
                    <div className="driverselectbutton">
                      {/* Check if the driver is selected */}
                      {selectedDriver != null ? (
                        selectedDriver.id === driver.id ? (
                          <img
                            src="/correct.png"
                            alt="check"
                            className="selectedtag"
                          />
                        ) : (
                          <div className="none"></div>
                        )
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      ) : index === 2 ? (
        <div className="index3">
          <div className="drivertile drivertilesummary">
            <div className="driverinfo">
              <img
                src={selectedDriver.image} // Dynamic image
                alt="Driver"
                className="driverimg"
              />

              <div className="driverinfodetails">
                <div className="drivername drivernamesummary">
                  {selectedDriver.name}
                </div>
                <div className="driverage driveragesummary">
                  Age - {selectedDriver.age}
                </div>
              </div>
            </div>
            <div className="driverbutton driverbuttonsummary">
              <div className="faretag">Fare</div>
              {fareData.fare.split(' ')[0]}
            </div>
          </div>
          <div className="locationdetailssummary">
            <div className="pickupsummary">
              <div className="pickuptagsumary">
                <div className="circle-small circlesummary"></div>
                Pickup Location
              </div>
              <div className="pickuplocationname">{pickupLocation.label}</div>
            </div>
            <div className="sep"></div>
            <div className="pickupsummary">
              <div className="pickuptagsumary">
                <div className="circle-small circlesummary"></div>
                Drop Location
              </div>
              <div className="pickuplocationname">{dropLocation.label}</div>
            </div>
          </div>
          <div className="specifics">
            <div className="pickupfromhostel">
              {isHostelPickup ? (
                <div className="pickuptagsumary">
                  <div className="circle-small circlesummary blackcircle"></div>
                  Pickup From Hostel
                </div>
              ) : null}
            </div>
            <div className="pickupfromhostel">
              <div className="pickuptagsumary">
                <div className="circle-small circlesummary blackcircle"></div>
                Passengers - {passengerCount}
              </div>
            </div>
            <div className="pickupfromhostel">
              <div className="pickuptagsumary">
                <div className="circle-small circlesummary blackcircle"></div>
                Time of Ride - {time}
              </div>
            </div>
            <div className="pickupfromhostel">
              <div className="pickuptagsumary">
                <div className="circle-small circlesummary blackcircle"></div>
                Name - {localStorage.getItem('username')}
              </div>
            </div>
            <div className="pickupfromhostel">
              <div className="pickuptagsumary">
                <div className="circle-small circlesummary blackcircle"></div>
                Phone - {localStorage.getItem('phone')}
              </div>
            </div>
          </div>
          <div className="sep"></div>
          <div className="faresummary">
            <div className="faretag2">Total Fare</div>
            <div className="finalFare">{fareData.fare.split(' ')[0]}</div>
          </div>
          <div className="submitbutton" onClick={() => bookTheRide()}>
            {loading ? <span className="loader2"></span> : 'Book the Ride'}
          </div>
        </div>
      ) : null}

      {modalVisible && (
        <div className="modal-overlay">
          <div className="modal-container">
            <button
              className="modal-close"
              onClick={() => setModalVisible(false)}
            >
              ×
            </button>
            <div className="modal-header">Enter Your Details</div>
            <div className="modal-content">
              Please provide your name and phone number to proceed with the
              booking.
            </div>
            <input
              type="text"
              className="modal-input"
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
            <input
              type="tel"
              className="modal-input"
              placeholder="Phone Number"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="modal-button" onClick={handleSaveUserDetails}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {index === 0 ? (
        // Screen 0 (First Screen) - Show Booking Summary before fare check
        <>
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
        </>
      ) : index === 1 ? (
        // Screen 1 (Second Screen) - After fare check or when index is 1
        <>
          <div className="bookingsummary">
            <div className="firstsummary">
              <div className="from from2">
                <div className="circle circle2"></div>
                {'Fare - ' + fareData.fare.split(' ')[0]}
              </div>
              <div className="to to2">
                <div className="circle circlehide"></div>
                {pickupLocation.label + '-' + dropLocation.label}
              </div>
            </div>
            <div className="secondsummary">
              <div
                className="checkfarebutton"
                onClick={() => {
                  if (selectedDriver != null) {
                    setIndex(2);
                  } else {
                    alert('Please select a driver');
                  }
                }}
              >
                {loading ? <span className="loader"></span> : 'Confirm Driver'}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
