const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

//Local variables to store data

let rooms = [];
let bookings = [];
let customers = [];

//Creating a room
app.post('/createroom',(req,res) => {
    const { roomName , seatsAvailable,amenities,pricePrHr } = req.body;
    const room = {
        id : rooms.length + 1,
        roomName,
        seatsAvailable,
        amenities,
        pricePrHr
    };
    rooms.push(room);
    res.json(room);
});

//Api endpoint for viewing the added rooms
app.get('/createroom',(req,res) => {
    res.json(rooms);
});

//Booking a room
app.post('/bookroom', (req, res) => {
  const { customerName, date, startTime, endTime, roomId } = req.body;
  const room = rooms.find((room) => room.id === roomId);

  if (!room) {
    res.status(404).json({ error: 'Room not Found' });
    return;
  }

  const existingBooking = bookings.find(
    (booking) =>
      booking.roomId === roomId &&
      booking.date === date &&
      (
        (startTime >= booking.startTime && startTime < booking.endTime) ||
        (endTime > booking.startTime && endTime <= booking.endTime) ||
        (startTime <= booking.startTime && endTime >= booking.endTime)
      )
  );

  if (existingBooking) {
    res.status(409).json({ error: 'Room already booked at the specified time' });
    return;
  }

  const booking = {
    id: bookings.length + 1,
    customerName,
    date,
    startTime,
    endTime,
    roomId,
    roomName: room.roomName,
    bookedStatus: true,
  };

  bookings.push(booking);

  const customer = customers.find((cust) => cust.name === customerName);

  if (customer) {
    customer.bookings.push(booking);
  } else {
    customers.push({ name: customerName, bookings: [booking] });
  }

  res.json(booking);
});

//List all booked rooms
app.get('/viewbooking',(req,res) => {
    const bookedRooms = bookings.map(booking => {
        const {roomName ,bookedStatus,customerName,date,startTime,endTime} = booking;
        return {roomName ,bookedStatus,customerName,date,startTime,endTime} 
    });
    res.json(bookedRooms);
});

//List customers with booked data
app.get('/customers', (req, res) => {
    const customerBookings = customers.map(customer => {
      const { name, bookings } = customer;
      const customerDetails = bookings.map(booking => {
        const { roomName, date, startTime, endTime } = booking;
        return { name, roomName, date, startTime, endTime };
      });
      return customerDetails;
    }).flat();
    res.json(customerBookings);
  });
  
  //List no of times customer booked a room
  app.get('/customer/:name', (req, res) => {
    const { name } = req.params;
    const customer = customers.find(cust => cust.name ===  name);
    if (!customer) {
      res.status(404).json({ error: 'Customer not found' });
      return;
    }
    else{
    const customerBookings = customer.bookings.map(booking => {
      const { roomName, date, startTime, endTime, id, bookedStatus, bookingDate } = booking;
      return { name, roomName, date, startTime, endTime, bookingId: id, bookedStatus, bookingDate };
    });
    res.json(customerBookings);
    }
  });

// Starting the server
app.listen(3000, () => {
    console.log('Server is running on port 3000');
  });