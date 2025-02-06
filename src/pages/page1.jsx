import { Link } from 'react-router-dom';
export default function Page1() {
  return (
    <div className="page1">
      <div className="firsttag">
        <div className="tag">
          <img src="/tuktuk.png" alt="autoimage" className="tagimg" />
          <div className="tagname">Travelling Simplified</div>
        </div>
      </div>
      <div className="heroheader">
        <div className="line1">Your Rides.</div>
        <div className="line2">Simplified.</div>
      </div>
      <div className="description">
        Automate simplifies autorickshaw booking for VIT students—quick,
        reliable, and effortless!
      </div>
      <div className="banner">
        <div className="bookingbanner">
          <div className="top">
            <div className="circle-small"></div>
            <div className="tag-name">Save 30% on Travelling</div>
          </div>
          <div className="center">
            <div className="center1">Book Now</div>
            {/* <div className="center2">Now</div> */}
            <div className="desc">Autorickshaws on the Go</div>
          </div>
          <Link to={'/book-Ride'} className="bookbutton">
            Get a Ride
          </Link>
        </div>
      </div>
    </div>
  );
}
