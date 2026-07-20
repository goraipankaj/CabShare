/**
 * Seeds the database with sample users, drivers, vehicles, rides, and bookings
 * so the app has realistic data to demo against.
 *
 * Usage: npm run seed   (from server/, requires MONGO_URI in .env)
 */
require('dotenv').config();
const { faker } = require('@faker-js/faker');
const mongoose = require('mongoose');
const connectDB = require('../config/db');

const User = require('../models/User');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');
const Wallet = require('../models/Wallet');
const Review = require('../models/Review');
const Notification = require('../models/Notification');

const CITIES = [
  { name: 'Connaught Place, Delhi', lat: 28.6315, lng: 77.2167 },
  { name: 'Cyber City, Gurugram', lat: 28.4949, lng: 77.0891 },
  { name: 'Sector 62, Noida', lat: 28.6141, lng: 77.3660 },
  { name: 'Karol Bagh, Delhi', lat: 28.6517, lng: 77.1909 },
  { name: 'Indirapuram, Ghaziabad', lat: 28.6428, lng: 77.3714 },
  { name: 'Dwarka, Delhi', lat: 28.5921, lng: 77.0460 },
];

const VEHICLE_TYPES = ['hatchback', 'sedan', 'suv', 'auto'];

const randomCity = () => CITIES[Math.floor(Math.random() * CITIES.length)];
const jitter = (val) => val + (Math.random() - 0.5) * 0.01;

const seed = async () => {
  await connectDB();
  console.log('Clearing existing collections...');
  await Promise.all([
    User.deleteMany({}),
    Driver.deleteMany({}),
    Vehicle.deleteMany({}),
    Ride.deleteMany({}),
    Booking.deleteMany({}),
    Wallet.deleteMany({}),
    Review.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  console.log('Creating admin account...');
  const admin = await User.create({
    name: 'CabShare Admin',
    email: 'admin@cabshare.app',
    phone: '+919999900000',
    password: 'Admin@12345',
    role: 'admin',
    isEmailVerified: true,
    isPhoneVerified: true,
  });
  await Wallet.create({ user: admin._id, balance: 0 });

  console.log('Creating passengers...');
  const passengers = [];
  for (let i = 0; i < 40; i += 1) {
    const name = faker.person.fullName();
    const user = await User.create({
      name,
      email: faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase(),
      phone: `+9198${faker.string.numeric(8)}`,
      password: 'Passenger@123',
      role: 'passenger',
      gender: faker.helpers.arrayElement(['male', 'female']),
      isEmailVerified: true,
      isPhoneVerified: true,
      ratingAverage: faker.number.float({ min: 3.5, max: 5, precision: 0.1 }),
      ratingCount: faker.number.int({ min: 0, max: 40 }),
    });
    await Wallet.create({ user: user._id, balance: faker.number.int({ min: 0, max: 2000 }) });
    passengers.push(user);
  }

  console.log('Creating drivers + vehicles...');
  const drivers = [];
  for (let i = 0; i < 15; i += 1) {
    const name = faker.person.fullName();
    const user = await User.create({
      name,
      email: faker.internet.email({ firstName: name.split(' ')[0] }).toLowerCase(),
      phone: `+9197${faker.string.numeric(8)}`,
      password: 'Driver@123',
      role: 'driver',
      gender: faker.helpers.arrayElement(['male', 'female']),
      isEmailVerified: true,
      isPhoneVerified: true,
      isDriverProfileCreated: true,
      ratingAverage: faker.number.float({ min: 3.8, max: 5, precision: 0.1 }),
      ratingCount: faker.number.int({ min: 5, max: 120 }),
    });
    await Wallet.create({ user: user._id, balance: faker.number.int({ min: 0, max: 5000 }) });

    const driverProfile = await Driver.create({
      user: user._id,
      licenseNumber: `DL${faker.string.numeric(9)}`,
      licenseExpiry: faker.date.future({ years: 3 }),
      verificationStatus: 'approved',
      verifiedBy: admin._id,
      verifiedAt: new Date(),
      isAvailable: faker.datatype.boolean(),
      totalEarnings: faker.number.int({ min: 500, max: 40000 }),
      totalTrips: faker.number.int({ min: 5, max: 200 }),
      totalDistanceKm: faker.number.int({ min: 50, max: 5000 }),
      ratingAverage: user.ratingAverage,
      ratingCount: user.ratingCount,
    });

    const vehicle = await Vehicle.create({
      driver: user._id,
      type: faker.helpers.arrayElement(VEHICLE_TYPES),
      brand: faker.helpers.arrayElement(['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Toyota', 'Honda']),
      model: faker.vehicle.model(),
      color: faker.color.human(),
      registrationNumber: `DL${faker.string.numeric(2)}${faker.string.alpha({ length: 2, casing: 'upper' })}${faker.string.numeric(4)}`,
      seatingCapacity: faker.helpers.arrayElement([3, 4, 6]),
      year: faker.number.int({ min: 2016, max: 2025 }),
      verificationStatus: 'approved',
      verifiedBy: admin._id,
      verifiedAt: new Date(),
    });

    driverProfile.activeVehicle = vehicle._id;
    await driverProfile.save();

    drivers.push({ user, driverProfile, vehicle });
  }

  console.log('Creating rides...');
  const rides = [];
  for (let i = 0; i < 80; i += 1) {
    const { user, vehicle } = faker.helpers.arrayElement(drivers);
    const source = randomCity();
    let destination = randomCity();
    while (destination.name === source.name) destination = randomCity();

    const totalSeats = faker.helpers.arrayElement([2, 3, 4]);
    const daysOffset = faker.number.int({ min: -10, max: 10 });
    const departureDate = new Date();
    departureDate.setDate(departureDate.getDate() + daysOffset);

    const status = daysOffset < -1 ? faker.helpers.arrayElement(['completed', 'cancelled']) : 'scheduled';

    const ride = await Ride.create({
      driver: user._id,
      vehicle: vehicle._id,
      source: { address: source.name, lat: jitter(source.lat), lng: jitter(source.lng) },
      destination: { address: destination.name, lat: jitter(destination.lat), lng: jitter(destination.lng) },
      route: { distanceKm: faker.number.int({ min: 5, max: 45 }), durationMin: faker.number.int({ min: 15, max: 90 }) },
      departureDate,
      departureTime: `${faker.number.int({ min: 6, max: 21 })}:${faker.helpers.arrayElement(['00', '15', '30', '45'])}`,
      totalSeats,
      availableSeats: status === 'scheduled' ? faker.number.int({ min: 0, max: totalSeats }) : 0,
      pricePerSeat: faker.number.int({ min: 80, max: 450 }),
      genderPreference: faker.helpers.arrayElement(['any', 'any', 'any', 'male_only', 'female_only']),
      instantBooking: faker.datatype.boolean(),
      status,
    });
    rides.push(ride);
  }

  console.log('Creating bookings...');
  const bookingStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
  let bookingCount = 0;
  for (const ride of rides) {
    const numBookings = faker.number.int({ min: 0, max: 3 });
    for (let j = 0; j < numBookings; j += 1) {
      const passenger = faker.helpers.arrayElement(passengers);
      const seatsBooked = faker.number.int({ min: 1, max: 2 });
      const status = ride.status === 'completed'
        ? 'completed'
        : ride.status === 'cancelled'
          ? 'cancelled'
          : faker.helpers.arrayElement(bookingStatuses);

      await Booking.create({
        ride: ride._id,
        passenger: passenger._id,
        driver: ride.driver,
        seatsBooked,
        totalFare: seatsBooked * ride.pricePerSeat,
        status,
        paymentStatus: status === 'completed' ? 'paid' : 'unpaid',
        paymentMethod: faker.helpers.arrayElement(['upi', 'card', 'wallet', 'cash']),
      });
      bookingCount += 1;
    }
  }

  console.log('\nSeed complete:');
  console.log(`  Admin login:      admin@cabshare.app / Admin@12345`);
  console.log(`  Passengers:       ${passengers.length} (password: Passenger@123)`);
  console.log(`  Drivers:          ${drivers.length} (password: Driver@123)`);
  console.log(`  Rides:            ${rides.length}`);
  console.log(`  Bookings:         ${bookingCount}`);

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
