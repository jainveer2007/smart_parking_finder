import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getSlots, registerVehicle, getReservations } from '../services/api';
import {
  Car,
  Bike,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  CalendarCheck,
  Clock,
  Sparkles,
  ShieldCheck,
  Hash,
  Loader2,
  ExternalLink,
} from 'lucide-react';

export default function BookSlot() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve vehicle parameters from state or sessionStorage
  const [vehicleData, setVehicleData] = useState(() => {
    if (location.state?.vehicleNumber) {
      return location.state;
    }
    try {
      const stored = sessionStorage.getItem('smart_parking_vehicle');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Slot and reservation state
  const [slots, setSlots] = useState([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(true);
  const [slotsError, setSlotsError] = useState('');

  // Booking action state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  // Load parking slots on page load
  const loadSlots = async () => {
    setIsLoadingSlots(true);
    setSlotsError('');
    const result = await getSlots();
    if (result.success) {
      setSlots(result.data);
    } else {
      setSlotsError(result.message);
    }
    setIsLoadingSlots(false);
  };

  useEffect(() => {
    loadSlots();
  }, []);

  // Handle registering vehicle and booking slot
  const handleRegisterAndBook = async () => {
    if (!vehicleData?.vehicleNumber || !vehicleData?.vehicleType) {
      navigate('/book');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    try {
      // 1. Send POST /register
      const regResult = await registerVehicle(
        vehicleData.vehicleNumber,
        vehicleData.vehicleType
      );

      if (!regResult.success) {
        setBookingError(regResult.message || 'Unable to book parking slot.');
        setIsSubmitting(false);
        // Refresh slots in case status changed
        loadSlots();
        return;
      }

      // 2. Refresh parking slots to update visual status
      const updatedSlotsResult = await getSlots();
      if (updatedSlotsResult.success) {
        setSlots(updatedSlotsResult.data);
      }

      // 3. Fetch latest reservations to retrieve assigned slot and reservation ID
      const resResult = await getReservations();
      let matchedReservation = null;

      if (resResult.success && Array.isArray(resResult.data)) {
        const normalizedPlate = vehicleData.vehicleNumber.trim().toUpperCase();
        const matches = resResult.data.filter(
          (r) => r.vehicleNumber && r.vehicleNumber.trim().toUpperCase() === normalizedPlate
        );
        if (matches.length > 0) {
          matchedReservation = matches[matches.length - 1];
        }
      }

      // 4. Set booking success state
      setBookingSuccess({
        slotNumber: matchedReservation?.slotNumber ?? 'Assigned',
        reservationId: matchedReservation?.reservationId ?? null,
        entryTime: matchedReservation?.entryTime ?? new Date().toISOString(),
        durationMinutes: matchedReservation?.durationMinutes ?? 0,
        vehicleNumber: vehicleData.vehicleNumber,
        vehicleType: vehicleData.vehicleType,
      });

      setIsSubmitting(false);
    } catch {
      setBookingError('Something went wrong during booking. Please try again.');
      setIsSubmitting(false);
    }
  };

  const totalSlotsCount = slots.length;
  const availableSlotsCount = slots.filter((s) => s.available).length;
  const occupiedSlotsCount = totalSlotsCount - availableSlotsCount;

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col">
        {/* Navigation Breadcrumb & Live Refresh Button */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 animate-fade-in">
          <Link
            to="/book"
            className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal-600 hover:text-charcoal-900 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-charcoal-100 flex items-center justify-center text-charcoal-500 group-hover:border-sage-300 group-hover:text-charcoal-800 shadow-soft-sm transition-all">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </div>
            <span>Change Vehicle Details</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={loadSlots}
              disabled={isLoadingSlots}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-charcoal-100 shadow-soft-sm text-xs font-semibold text-charcoal-700 hover:border-sage-300 hover:text-sage-700 transition-all cursor-pointer disabled:opacity-60"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isLoadingSlots ? 'animate-spin text-sage-600' : ''}`}
              />
              <span>Refresh Status</span>
            </button>

          </div>
        </div>

        {/* Dashboard Title & Quick Stats */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 tracking-tight font-sans mt-2">
                Parking Dashboard
              </h1>
            </div>

            {/* Quick Metrics */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2.5 rounded-2xl bg-white border border-charcoal-100 shadow-soft-sm text-center">
                <span className="text-xs text-charcoal-500 block font-medium">Available</span>
                <span className="text-lg font-bold text-emerald-600 font-sans">
                  {availableSlotsCount} <span className="text-xs text-charcoal-400">/ {totalSlotsCount}</span>
                </span>
              </div>
              <div className="px-4 py-2.5 rounded-2xl bg-white border border-charcoal-100 shadow-soft-sm text-center">
                <span className="text-xs text-charcoal-500 block font-medium">Occupied</span>
                <span className="text-lg font-bold text-charcoal-800 font-sans">
                  {occupiedSlotsCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Global Error Banner if API failed */}
        {slotsError && (
          <div
            role="alert"
            className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-sm text-rose-800"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-rose-900">Unable to load parking slots</p>
              <p className="text-rose-700">{slotsError}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Visual Parking Lot Grid */}
          <section className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-charcoal-100 shadow-soft p-6 sm:p-8 animate-fade-in-up">
              <div className="flex items-center justify-between pb-5 border-b border-charcoal-100/70">
                <div>
                  <h2 className="text-lg font-bold text-charcoal-900 font-sans">
                    Parking Map
                  </h2>
                  
                </div>
                <div className="flex items-center gap-3 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-charcoal-600">Available</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-charcoal-400"></span>
                    <span className="text-charcoal-600">Occupied</span>
                  </div>
                </div>
              </div>

              {/* Slot Cards Grid */}
              {isLoadingSlots ? (
                <div className="py-16 flex flex-col items-center justify-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-sage-600" />
                  <span className="text-xs text-charcoal-500 font-medium">
                    Loading bay status from backend...
                  </span>
                </div>
              ) : slots.length === 0 ? (
                <div className="py-12 text-center text-sm text-charcoal-500">
                  No parking slots configured on this system.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6">
                  {slots.map((slot) => {
                    const isAssignedToUser =
                      bookingSuccess && bookingSuccess.slotNumber === slot.slotNumber;

                    return (
                      <div
                        key={slot.slotNumber}
                        className={`relative rounded-2xl p-4 sm:p-5 border transition-all duration-300 flex flex-col justify-between ${
                          isAssignedToUser
                            ? 'bg-sage-50/90 border-sage-600 ring-2 ring-sage-500/30 shadow-soft'
                            : slot.available
                            ? 'bg-background-warm/40 border-sage-200/90 hover:border-sage-400 hover:shadow-soft-sm'
                            : 'bg-charcoal-50/70 border-charcoal-100 opacity-80'
                        }`}
                      >
                        {/* Top Badges */}
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-extrabold text-charcoal-900 tracking-tight font-sans">
                            Slot {slot.slotNumber}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              slot.available
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-charcoal-100 text-charcoal-600 border-charcoal-200'
                            }`}
                          >
                            {slot.available ? 'Available' : 'Occupied'}
                          </span>
                        </div>

                        {/* Visual slot representation */}
                        <div className="my-2 flex items-center justify-center py-4 rounded-xl bg-white/70 border border-charcoal-100/60">
                          {slot.available ? (
                            <div className="text-center">
                              <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
                              <span className="text-[11px] font-semibold text-emerald-700 block mt-1">
                                Ready to Park
                              </span>
                            </div>
                          ) : (
                            <div className="text-center">
                              <Car className="w-7 h-7 text-charcoal-500 mx-auto" />
                              <span className="text-[11px] font-semibold text-charcoal-600 block mt-1">
                                In Use
                              </span>
                            </div>
                          )}
                        </div>

                        {/* If this slot was assigned to the user */}
                        {isAssignedToUser && (
                          <div className="mt-2 text-center py-1 px-2 rounded-lg bg-sage-600 text-white text-[10px] font-bold tracking-wide uppercase shadow-soft-sm">
                            Your Assigned Slot
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Informational footer note */}
            </div>
          </section>

          {/* RIGHT COLUMN: Booking Action & Reservation Summary */}
          <section className="lg:col-span-5 space-y-6">
            {/* 1. SUCCESS STATE: Shown after successful booking */}
            {bookingSuccess ? (
              <div className="bg-white rounded-3xl border border-sage-300 shadow-soft p-6 sm:p-8 animate-fade-in-up space-y-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sage-100 border border-sage-300 flex items-center justify-center text-sage-700 shadow-soft-sm">
                    <CheckCircle2 className="w-6 h-6 text-sage-700" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-sage-700 uppercase tracking-wide">
                      Booking Confirmed
                    </span>
                    <h2 className="text-xl font-bold text-charcoal-900 font-sans">
                      Slot {bookingSuccess.slotNumber} Reserved!
                    </h2>
                  </div>
                </div>

                {/* Details Table */}
                <div className="p-4 rounded-2xl bg-sage-50/60 border border-sage-200/80 space-y-3 text-xs sm:text-sm font-sans">
                  <div className="flex items-center justify-between pb-2 border-b border-sage-200/60">
                    <span className="text-charcoal-500 font-medium">Assigned Parking Slot:</span>
                    <span className="font-extrabold text-charcoal-900 text-base text-sage-700">
                      Slot {bookingSuccess.slotNumber}
                    </span>
                  </div>

                  {bookingSuccess.reservationId && (
                    <div className="flex items-center justify-between pb-2 border-b border-sage-200/60">
                      <span className="text-charcoal-500 font-medium">Reservation ID:</span>
                      <span className="font-bold text-charcoal-900 bg-white px-2 py-0.5 rounded border border-sage-200">
                        #{bookingSuccess.reservationId}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center justify-between pb-2 border-b border-sage-200/60">
                    <span className="text-charcoal-500 font-medium">Vehicle Number:</span>
                    <span className="font-bold text-charcoal-900">
                      {bookingSuccess.vehicleNumber}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-sage-200/60">
                    <span className="text-charcoal-500 font-medium">Vehicle Category:</span>
                    <span className="font-semibold text-charcoal-800 capitalize">
                      {bookingSuccess.vehicleType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-charcoal-500 font-medium">Entry Timestamp:</span>
                    <span className="text-charcoal-700 font-medium">
                      {new Date(bookingSuccess.entryTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-background-subtle border border-charcoal-100 text-xs text-charcoal-600 leading-relaxed">
                  <p className="font-semibold text-charcoal-800 mb-1">
                    Keep your details for departure:
                  </p>
                  Your reservation ID <strong>#{bookingSuccess.reservationId}</strong> and vehicle number will be used when releasing your slot.
                </div>

                {/* Post-booking action buttons */}
                <div className="space-y-3 pt-2">
                  <Link
                    to="/release"
                    className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-charcoal-900 text-white text-sm font-semibold hover:bg-charcoal-800 transition-colors shadow-soft"
                  >
                    <span>Proceed to Release Flow</span>
                    <ArrowRight className="w-4 h-4 text-sage-300" />
                  </Link>
                  <Link
                    to="/"
                    className="w-full inline-flex items-center justify-center px-5 py-2.5 rounded-xl border border-charcoal-200 text-charcoal-700 text-xs font-semibold hover:bg-background-subtle transition-colors"
                  >
                    Return to Landing Page
                  </Link>
                </div>
              </div>
            ) : vehicleData?.vehicleNumber ? (
              /* 2. CONFIRM BOOKING CARD: Vehicle info provided, awaiting booking */
              <div className="bg-white rounded-3xl border border-charcoal-100 shadow-soft p-6 sm:p-8 animate-fade-in-up space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-50 border border-sage-200 text-xs font-bold text-sage-800 uppercase tracking-wide">
                    <CalendarCheck className="w-3.5 h-3.5 text-sage-600" />
                    <span>Confirm Booking</span>
                  </div>
                  <h2 className="text-xl font-bold text-charcoal-900 font-sans mt-2">
                    Reserve an Available Slot
                  </h2>
                  <p className="text-xs text-charcoal-600 font-sans mt-1">
                    Confirm your vehicle details to allow the system to allocate the first available bay.
                  </p>
                </div>

                {/* Vehicle details summary card */}
                <div className="p-4 rounded-2xl bg-background-light border border-charcoal-100 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-charcoal-100/70">
                    <span className="text-xs text-charcoal-500 font-medium">Vehicle Plate</span>
                    <span className="text-sm font-extrabold text-charcoal-900 tracking-wider">
                      {vehicleData.vehicleNumber}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-charcoal-500 font-medium">Vehicle Category</span>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-charcoal-800 capitalize">
                      {vehicleData.vehicleType?.toLowerCase() === 'car' ? (
                        <Car className="w-4 h-4 text-sage-600" />
                      ) : (
                        <Bike className="w-4 h-4 text-sage-600" />
                      )}
                      <span>{vehicleData.vehicleType}</span>
                    </div>
                  </div>
                </div>

                {/* Booking error if backend returned error */}
                {bookingError && (
                  <div
                    role="alert"
                    className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-fade-in"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <p>{bookingError}</p>
                  </div>
                )}

                {/* Primary Action Button */}
                <button
                  type="button"
                  onClick={handleRegisterAndBook}
                  disabled={isSubmitting || availableSlotsCount === 0}
                  className="w-full group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-charcoal-900 text-white text-sm sm:text-base font-semibold shadow-soft hover:bg-charcoal-800 hover:shadow-soft-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sage-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-sage-300" />
                      <span>Allocating Bay...</span>
                    </>
                  ) : availableSlotsCount === 0 ? (
                    <span>No Parking Slots Available</span>
                  ) : (
                    <>
                      <span>Confirm & Book First Available Slot</span>
                      <ArrowRight className="w-4 h-4 text-sage-300 transition-transform duration-200 group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                {availableSlotsCount === 0 && (
                  <p className="text-xs text-rose-600 text-center font-medium font-sans">
                    All bays are occupied. Please wait for an existing vehicle to release.
                  </p>
                )}
              </div>
            ) : (
              /* 3. NO VEHICLE ENTERED: Prompt to enter vehicle */
              <div className="bg-white rounded-3xl border border-charcoal-100 shadow-soft p-6 sm:p-8 text-center space-y-4 animate-fade-in-up">
                <div className="w-12 h-12 rounded-2xl bg-sage-50 border border-sage-200 flex items-center justify-center text-sage-700 mx-auto">
                  <Car className="w-6 h-6 text-sage-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-charcoal-900 font-sans">
                    Enter Vehicle Details
                  </h3>
                  <p className="text-xs text-charcoal-600 leading-relaxed font-sans mt-1">
                    To reserve a bay on this dashboard, please provide your vehicle number and category first.
                  </p>
                </div>
                <Link
                  to="/book"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-charcoal-900 text-white text-xs font-semibold hover:bg-charcoal-800 transition-colors shadow-soft"
                >
                  <span>Enter Vehicle Information</span>
                  <ArrowRight className="w-3.5 h-3.5 text-sage-300" />
                </Link>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="w-full border-t border-charcoal-100/60 py-6 bg-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-500 gap-3">
          <p>© {new Date().getFullYear()} Smart Parking Finder. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Automated Bay Allocation</span>
            <span>•</span>
            <span>Real-time Sensing</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
