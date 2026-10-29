import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { releaseSlot, getReservations, getSlots } from '../services/api';
import {
  Car,
  Bike,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Receipt,
  Loader2,
} from 'lucide-react';

export default function ReleaseSlot() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve initial reservation payload from navigation state or sessionStorage
  const [releaseData, setReleaseData] = useState(() => {
    if (location.state?.reservation) {
      return location.state;
    }
    try {
      const stored = sessionStorage.getItem('smart_parking_release');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const reservation = releaseData?.reservation;
  const vehicleNumber = releaseData?.vehicleNumber || reservation?.vehicleNumber;
  const vehicleType = releaseData?.vehicleType;

  // Active reservation metrics refreshed from GET /reservations
  const [currentReservation, setCurrentReservation] = useState(reservation || null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Release action state
  const [isReleasing, setIsReleasing] = useState(false);
  const [releaseError, setReleaseError] = useState('');
  const [releaseSuccess, setReleaseSuccess] = useState(null);

  // Refresh current reservation duration and fee from backend
  const refreshReservationDetails = async () => {
    if (!reservation?.reservationId) return;
    setIsRefreshing(true);
    setReleaseError('');

    try {
      const resResult = await getReservations();
      if (resResult.success && Array.isArray(resResult.data)) {
        const found = resResult.data.find(
          (r) => r.reservationId === reservation.reservationId
        );
        if (found) {
          setCurrentReservation(found);
        }
      }
    } catch {
      // Keep existing data if refresh fails
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (reservation?.reservationId) {
      refreshReservationDetails();
    }
  }, [reservation?.reservationId]);

  // Execute release operation using POST /release with reservationId
  const handleReleaseSlot = async () => {
    if (!currentReservation?.reservationId) {
      setReleaseError('Valid reservation ID is required to release the parking slot.');
      return;
    }

    setIsReleasing(true);
    setReleaseError('');

    try {
      // 1. Send POST /release with { reservationId }
      const result = await releaseSlot(currentReservation.reservationId);

      if (!result.success) {
        setReleaseError(result.message || 'Unable to release parking slot.');
        setIsReleasing(false);
        return;
      }

      // 2. Fetch latest reservation info for final duration and fee calculation from backend
      const resResult = await getReservations();
      let finalRes = currentReservation;
      if (resResult.success && Array.isArray(resResult.data)) {
        const matchingFinal = resResult.data.find(
          (r) => r.reservationId === currentReservation.reservationId
        );
        if (matchingFinal) {
          finalRes = matchingFinal;
        }
      }

      // 3. Refresh slots so backend slot availability is updated
      await getSlots();

      // Clear stored release data
      try {
        sessionStorage.removeItem('smart_parking_release');
      } catch {
        // Ignore
      }

      // 4. Set clean release-success state
      setReleaseSuccess({
        reservationId: finalRes.reservationId,
        vehicleNumber: finalRes.vehicleNumber || vehicleNumber,
        slotNumber: finalRes.slotNumber,
        durationMinutes: finalRes.durationMinutes,
        fee: finalRes.fee,
        releasedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });

      setIsReleasing(false);
    } catch {
      setReleaseError('Something went wrong during slot release. Please try again.');
      setIsReleasing(false);
    }
  };

  // Helper format for entry time
  const formatTime = (isoString) => {
    if (!isoString) return 'Active session';
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background-light">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center">
        {/* Breadcrumb & Flow Indicator */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 animate-fade-in">
          <Link
            to="/release"
            className="inline-flex items-center gap-2 text-sm font-semibold text-charcoal-600 hover:text-charcoal-900 transition-colors group"
          >
            <div className="w-8 h-8 rounded-lg bg-white border border-charcoal-100 flex items-center justify-center text-charcoal-500 group-hover:border-sage-300 group-hover:text-charcoal-800 shadow-soft-sm transition-all">
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
            </div>
            <span>Check Another Vehicle</span>
          </Link>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-charcoal-100 shadow-soft-sm text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span className="text-charcoal-700">Release Slot Flow</span>
            <span className="text-charcoal-400">•</span>
            <span className="text-charcoal-500 font-normal">Step 2 of 2</span>
          </div>
        </div>

        {/* 1. SUCCESS STATE: Displayed after release is finalized */}
        {releaseSuccess ? (
          <div className="bg-white rounded-3xl border border-sage-300 shadow-soft p-6 sm:p-10 lg:p-12 animate-fade-in-up space-y-8">
            <div className="text-center space-y-3 pb-6 border-b border-charcoal-100/70">
              <div className="w-14 h-14 rounded-2xl bg-sage-100 border border-sage-300 flex items-center justify-center text-sage-700 mx-auto shadow-soft-sm">
                <CheckCircle2 className="w-7 h-7 text-sage-700" />
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-50 border border-sage-200 text-xs font-bold text-sage-800 uppercase tracking-wide">
                <span>Release Completed</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-charcoal-900 tracking-tight font-sans">
                Parking Slot Released Successfully!
              </h1>
              <p className="text-sm text-charcoal-600 font-sans max-w-lg mx-auto">
                Bay #{releaseSuccess.slotNumber} has been vacated and made immediately available for other visitors.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-6 rounded-2xl bg-sage-50/60 border border-sage-200/80 space-y-4 font-sans text-sm">
              <div className="flex items-center justify-between pb-3 border-b border-sage-200/60">
                <span className="text-charcoal-500 font-medium">Vehicle Registration:</span>
                <span className="font-extrabold text-charcoal-900 tracking-wider">
                  {releaseSuccess.vehicleNumber}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-sage-200/60">
                <span className="text-charcoal-500 font-medium">Reservation Identifier:</span>
                <span className="font-bold text-charcoal-900 bg-white px-2.5 py-0.5 rounded border border-sage-200">
                  Reservation #{releaseSuccess.reservationId}
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-sage-200/60">
                <span className="text-charcoal-500 font-medium">Vacated Parking Bay:</span>
                <span className="font-extrabold text-emerald-700">
                  Bay #{releaseSuccess.slotNumber} (Available)
                </span>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-sage-200/60">
                <span className="text-charcoal-500 font-medium">Final Duration:</span>
                <span className="font-bold text-charcoal-900">
                  {releaseSuccess.durationMinutes} minute{releaseSuccess.durationMinutes === 1 ? '' : 's'}
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 text-base">
                <span className="text-charcoal-800 font-bold">Total Final Fee:</span>
                <span className="font-extrabold text-charcoal-900 text-xl text-sage-800">
                  ₹{Number(releaseSuccess.fee).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-charcoal-900 text-white text-sm font-semibold hover:bg-charcoal-800 transition-colors shadow-soft"
              >
                Return to Landing Page
              </Link>
              <Link
                to="/dashboard"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-charcoal-200 text-charcoal-700 text-sm font-semibold hover:bg-background-subtle transition-colors"
              >
                <span>View Parking Dashboard</span>
                <ArrowRight className="w-4 h-4 text-charcoal-500" />
              </Link>
            </div>
          </div>
        ) : currentReservation ? (
          /* 2. ACTIVE RESERVATION / FEE BREAKDOWN VIEW */
          <div className="bg-white rounded-3xl border border-charcoal-100 shadow-soft p-6 sm:p-10 lg:p-12 animate-fade-in-up space-y-8">
            {/* Header */}
            <div className="space-y-3 pb-6 border-b border-charcoal-100/70">
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sage-50 border border-sage-200 text-xs font-bold text-sage-800 uppercase tracking-wide">
                  <Receipt className="w-3.5 h-3.5 text-sage-600" />
                  <span>Session Summary</span>
                </div>

                <button
                  onClick={refreshReservationDetails}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-charcoal-200 text-xs font-semibold text-charcoal-600 hover:border-sage-300 hover:text-sage-700 transition-colors cursor-pointer"
                >
                  <RefreshCw
                    className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-sage-600' : ''}`}
                  />
                  <span>Recalculate Fee</span>
                </button>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-charcoal-900 tracking-tight font-sans">
                Review & Release Parking Slot
              </h1>
              <p className="text-sm sm:text-base text-charcoal-600 font-sans leading-relaxed">
                Review your current parking session duration and estimated fee calculated by the system.
              </p>
            </div>

            {/* Release error alert if backend returned error */}
            {releaseError && (
              <div
                role="alert"
                className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-sm text-rose-800 animate-fade-in"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-900">Release request failed</p>
                  <p className="text-rose-700">{releaseError}</p>
                </div>
              </div>
            )}

            {/* Reservation Data Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Vehicle & Reservation ID Card */}
              <div className="p-5 rounded-2xl bg-background-light border border-charcoal-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-charcoal-500 font-medium">Vehicle Registration</span>
                  <span className="text-sm font-extrabold text-charcoal-900 tracking-wider">
                    {currentReservation.vehicleNumber || vehicleNumber}
                  </span>
                </div>

                {vehicleType && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-charcoal-500 font-medium">Vehicle Category</span>
                    <span className="text-xs font-bold text-charcoal-800 capitalize">
                      {vehicleType}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-charcoal-100/70">
                  <span className="text-xs text-charcoal-500 font-medium">Reservation Identifier</span>
                  <span className="text-xs font-bold text-sage-800 bg-sage-50 px-2 py-0.5 rounded border border-sage-200">
                    ID #{currentReservation.reservationId}
                  </span>
                </div>
              </div>

              {/* Slot & Time Card */}
              <div className="p-5 rounded-2xl bg-background-light border border-charcoal-100 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-charcoal-500 font-medium">Assigned Parking Bay</span>
                  <span className="text-sm font-extrabold text-charcoal-900">
                    Bay #{currentReservation.slotNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-charcoal-500 font-medium">Entry Timestamp</span>
                  <span className="text-xs font-medium text-charcoal-700">
                    {formatTime(currentReservation.entryTime)}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-charcoal-100/70">
                  <span className="text-xs text-charcoal-500 font-medium">Current Duration</span>
                  <span className="text-xs font-bold text-charcoal-900">
                    {currentReservation.durationMinutes} minute{currentReservation.durationMinutes === 1 ? '' : 's'}
                  </span>
                </div>
              </div>
            </div>

            {/* Calculated Fee Highlight Box */}
            <div className="p-6 rounded-2xl bg-sage-50/70 border border-sage-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sage-700 bg-white px-2 py-0.5 rounded border border-sage-200">
                    Estimated / Current Parking Fee
                  </span>
                </div>
                <p className="text-xs text-charcoal-600 mt-1 font-sans">
                  Calculated automatically by the backend system based on standard mall tariff.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-3xl font-extrabold text-charcoal-900 tracking-tight font-sans">
                  ₹{Number(currentReservation.fee).toFixed(2)}
                </span>
                <span className="block text-[11px] text-charcoal-500">
                  Finalized upon release confirmation
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-charcoal-100/70">
              <Link
                to="/release"
                className="order-2 sm:order-1 px-5 py-3 rounded-xl border border-charcoal-200 text-sm font-semibold text-charcoal-700 hover:bg-background-subtle hover:text-charcoal-900 text-center transition-colors font-sans"
              >
                Back to Vehicle Lookup
              </Link>

              <button
                type="button"
                onClick={handleReleaseSlot}
                disabled={isReleasing}
                className="order-1 sm:order-2 group inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl bg-charcoal-900 text-white text-sm sm:text-base font-semibold shadow-soft hover:bg-charcoal-800 hover:shadow-soft-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sage-500 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isReleasing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-sage-300" />
                    <span>Processing Release...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4 text-sage-300" />
                    <span>Release Slot</span>
                    <ArrowRight className="w-4 h-4 text-sage-300 transition-transform duration-200 group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* 3. EMPTY STATE: No active reservation selected */
          <div className="bg-white rounded-3xl border border-charcoal-100 shadow-soft p-8 sm:p-12 text-center space-y-4 animate-fade-in-up">
            <div className="w-12 h-12 rounded-2xl bg-sage-50 border border-sage-200 flex items-center justify-center text-sage-700 mx-auto">
              <KeyRound className="w-6 h-6 text-sage-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-charcoal-900 font-sans">
                No Active Reservation Selected
              </h2>
              <p className="text-sm text-charcoal-600 font-sans max-w-md mx-auto mt-1">
                To calculate your parking fee and release your slot, please verify your registered vehicle on the vehicle information page.
              </p>
            </div>
            <div className="pt-2">
              <Link
                to="/release"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-charcoal-900 text-white text-sm font-semibold hover:bg-charcoal-800 transition-colors shadow-soft"
              >
                <span>Look Up Vehicle Reservation</span>
                <ArrowRight className="w-4 h-4 text-sage-300" />
              </Link>
            </div>
          </div>
        )}
      </main>

      <footer className="w-full border-t border-charcoal-100/60 py-6 bg-white/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-charcoal-500 gap-3">
          <p>© {new Date().getFullYear()} Smart Parking Finder. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Automated Exit Reconciliation</span>
            <span>•</span>
            <span>Tariff Verification</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
