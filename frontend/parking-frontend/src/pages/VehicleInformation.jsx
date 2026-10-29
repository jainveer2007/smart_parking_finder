import React, { useState } from 'react';
import { useNavigate, useLocation, Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import VehicleTypeSelector from '../components/VehicleTypeSelector';
import { findActiveReservation } from '../services/api';
import {
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Info,
  Sparkles,
  Hash,
  AlertCircle,
  Loader2,
} from 'lucide-react';

export default function VehicleInformation({ flow: propFlow }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  // Determine current flow: priority prop -> query param -> location state -> URL pathname
  const flowFromUrl = location.pathname.includes('release') ? 'release' : 'book';
  const queryFlow = searchParams.get('flow');
  const activeFlow = propFlow || queryFlow || location.state?.flow || flowFromUrl;
  const isBookingFlow = activeFlow === 'book';

  // Form state
  const [vehicleNumber, setVehicleNumber] = useState(
    location.state?.vehicleNumber || ''
  );
  const [vehicleType, setVehicleType] = useState(
    location.state?.vehicleType || ''
  );
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({ vehicleNumber: false, vehicleType: false });

  // Lookup & submission state
  const [isSearching, setIsSearching] = useState(false);
  const [backendError, setBackendError] = useState('');

  // Input change handler with auto-uppercase formatting for license plates
  const handleVehicleNumberChange = (e) => {
    const val = e.target.value.toUpperCase();
    setVehicleNumber(val);
    setBackendError('');
    if (errors.vehicleNumber) {
      setErrors((prev) => ({ ...prev, vehicleNumber: '' }));
    }
  };

  const handleTypeChange = (type) => {
    setVehicleType(type);
    setBackendError('');
    if (errors.vehicleType) {
      setErrors((prev) => ({ ...prev, vehicleType: '' }));
    }
  };

  // UI validation
  const validate = () => {
    const newErrors = {};
    const trimmedNumber = vehicleNumber.trim();

    if (!trimmedNumber) {
      newErrors.vehicleNumber = 'Vehicle number cannot be empty.';
    } else if (trimmedNumber.length < 3) {
      newErrors.vehicleNumber = 'Please enter a valid vehicle number (at least 3 characters).';
    }

    if (!vehicleType) {
      newErrors.vehicleType = 'Please select a vehicle type.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError('');
    setTouched({ vehicleNumber: true, vehicleType: true });

    if (!validate()) {
      return;
    }

    const normalizedNumber = vehicleNumber.trim().toUpperCase();

    // -------------------------------------------------------------
    // RELEASE FLOW: Find active reservation using GET /reservations
    // -------------------------------------------------------------
    if (!isBookingFlow) {
      setIsSearching(true);
      try {
        const lookup = await findActiveReservation(normalizedNumber);

        if (!lookup.success) {
          // IMPORTANT: Do NOT navigate to fee page. Stay on this page.
          setBackendError(lookup.message || 'No active reservation was found for this vehicle.');
          setIsSearching(false);
          return;
        }

        // Active reservation successfully identified
        const releasePayload = {
          vehicleNumber: normalizedNumber,
          vehicleType,
          reservation: lookup.reservation,
          flow: 'release',
          savedAt: new Date().toISOString(),
        };

        try {
          sessionStorage.setItem('smart_parking_release', JSON.stringify(releasePayload));
        } catch {
          // Ignore storage restrictions if any
        }

        setIsSearching(false);
        navigate('/release-fee', { state: releasePayload });
      } catch {
        setBackendError('Something went wrong while verifying reservation. Please try again.');
        setIsSearching(false);
      }
      return;
    }

    // -------------------------------------------------------------
    // BOOK FLOW: Save vehicle info and proceed to Parking Dashboard
    // -------------------------------------------------------------
    const bookingPayload = {
      vehicleNumber: normalizedNumber,
      vehicleType,
      flow: 'book',
      savedAt: new Date().toISOString(),
    };

    try {
      sessionStorage.setItem('smart_parking_vehicle', JSON.stringify(bookingPayload));
    } catch {
      // Ignore storage restrictions if any
    }

    navigate('/dashboard', { state: bookingPayload });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      {/* Top Navigation Bar */}
      <Header />

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center">
        {/* Back Link & Flow Indicator */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 animate-fade-in">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal-600 hover:text-charcoal-900 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-charcoal-100 flex items-center justify-center text-charcoal-500 group-hover:border-sage-300 group-hover:text-charcoal-800 shadow-soft-sm transition-all">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </div>
            <span>Return to Landing Page</span>
          </Link>

        </div>

        {/* Card Container */}
        <div className="bg-white rounded-3xl border border-charcoal-100 shadow-soft p-6 sm:p-10 lg:p-12 animate-fade-in-up">
          {/* Card Header & Dynamic Flow Heading */}
          <div className="space-y-3 pb-8 border-b border-charcoal-100/70">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-50 border border-sage-200/80 text-xs font-bold text-sage-800 uppercase tracking-wide">
              <span>Vehicle Information</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 tracking-tight font-sans">
              {isBookingFlow
                ? "Fill the details below."
                : "Let's find your parking details."}
            </h1>

            <p className="text-sm sm:text-base text-charcoal-600 font-sans leading-relaxed max-w-2xl">
              {isBookingFlow
                ? 'Enter your vehicle number and select the vehicle category.'
                : 'Enter your registered vehicle details to look up your active parking record and view duration and fee details.'}
            </p>
          </div>

          {/* Release flow educational notice (reservation ID requirement compliance) */}
          {!isBookingFlow && (
            <div className="mt-6 p-4 rounded-2xl bg-sage-50/70 border border-sage-200/80 flex items-start gap-3 text-xs sm:text-sm text-charcoal-700 animate-fade-in">
              <Info className="w-5 h-5 text-sage-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-charcoal-900">
                  Release process information
                </p>
                <p className="text-charcoal-600 leading-relaxed">
                  In accordance with parking lot policy, slot release and fee settlement require a valid reservation ID. We will search for your active reservation using your vehicle number before continuing.
                </p>
              </div>
            </div>
          )}

          {/* Backend Error Alert (e.g. No active reservation found) */}
          {backendError && (
            <div
              role="alert"
              className="mt-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-sm text-rose-800 animate-fade-in"
            >
              <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-rose-900">Unable to proceed</p>
                <p className="text-rose-700">{backendError}</p>
              </div>
            </div>
          )}

          {/* Form */}
          <form data-no-spark="true" onSubmit={handleSubmit} className="mt-8 space-y-7" noValidate>
            {/* Vehicle Details Input Area (ClickSpark excluded per instruction) */}
            <div data-no-spark="true" className="space-y-7">
              {/* Vehicle Number Input */}
              <div className="space-y-2">
                <label
                  htmlFor="vehicleNumber"
                  className="block text-sm font-semibold text-charcoal-800 font-sans"
                >
                  Vehicle Number <span className="text-rose-500"></span>
                </label>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-charcoal-400">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    id="vehicleNumber"
                    type="text"
                    value={vehicleNumber}
                    onChange={handleVehicleNumberChange}
                    onBlur={() => setTouched((prev) => ({ ...prev, vehicleNumber: true }))}
                    placeholder="enter your number"
                    maxLength={18}
                    disabled={isSearching}
                    autoComplete="off"
                    className={`w-full pl-10 pr-4 py-3.5 rounded-2xl border text-sm sm:text-base font-medium font-sans placeholder:text-charcoal-400 placeholder:font-normal bg-background-light/40 transition-all duration-200 focus:outline-none focus:bg-white ${
                      errors.vehicleNumber
                        ? 'border-rose-400 text-charcoal-900 focus:ring-2 focus:ring-rose-200'
                        : 'border-charcoal-200 text-charcoal-900 hover:border-charcoal-300 focus:border-sage-600 focus:ring-2 focus:ring-sage-500/20'
                    }`}
                    aria-invalid={Boolean(errors.vehicleNumber)}
                    aria-describedby={errors.vehicleNumber ? 'vehicleNumber-error' : undefined}
                  />
                </div>

                {errors.vehicleNumber ? (
                  <p
                    id="vehicleNumber-error"
                    className="text-xs font-medium text-rose-600 mt-1.5 flex items-center gap-1.5 animate-fade-in font-sans"
                  >
                    <span className="w-1 h-1 rounded-full bg-rose-500"></span>
                    {errors.vehicleNumber}
                  </p>
                ) : (
                  <p className="text-xs text-charcoal-500 font-sans">

                  </p>
                )}
              </div>

              {/* Vehicle Type Selector */}
              <VehicleTypeSelector
                selectedType={vehicleType}
                onChange={handleTypeChange}
                error={touched.vehicleType ? errors.vehicleType : ''}
              />
            </div>


            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-charcoal-100/70">
              <Link
                to="/"
                className="order-2 sm:order-1 px-5 py-3 rounded-xl border border-charcoal-200 text-sm font-semibold text-charcoal-700 hover:bg-background-subtle hover:text-charcoal-900 text-center transition-colors font-sans"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={isSearching}
                className="order-1 sm:order-2 group inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-charcoal-900 text-white text-sm sm:text-base font-semibold shadow-soft hover:bg-charcoal-800 hover:shadow-soft-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sage-500 focus:ring-offset-2 font-sans cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-sage-300" />
                    <span>Searching Reservations...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {isBookingFlow
                        ? 'Continue to Parking Dashboard'
                        : 'Find Reservation & Continue'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-sage-300 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-charcoal-100/60 py-6 bg-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-500 gap-3">
          <p>© {new Date().getFullYear()} Smart Parking Finder. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Secure Bay Reservation</span>
            <span>•</span>
            <span>Automated Exit Reconciliation</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
