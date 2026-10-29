const BASE_URL = 'http://localhost:8080';

/**
 * Fetch all parking slots and their live availability.
 * Endpoint: GET /slots
 */
export async function getSlots() {
  try {
    const res = await fetch(`${BASE_URL}/slots`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errData.message || errData.error || 'Failed to fetch parking slots.',
      };
    }
    const data = await res.json();
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch {
    return {
      success: false,
      message: 'Unable to connect to parking server. Please verify the backend is running.',
    };
  }
}

/**
 * Register a vehicle and automatically assign an available slot.
 * Endpoint: POST /register
 * Payload: { "vehicleNumber": "...", "vehicleType": "car" }
 */
export async function registerVehicle(vehicleNumber, vehicleType) {
  try {
    const res = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        vehicleNumber: vehicleNumber.trim().toUpperCase(),
        vehicleType: vehicleType.toLowerCase(),
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      let friendly = data.message || data.error || 'Registration failed.';
      if (res.status === 409 || friendly.toLowerCase().includes('no parking slots')) {
        friendly = 'No parking slots are currently available.';
      } else if (res.status === 400 || friendly.toLowerCase().includes('invalid vehicle')) {
        friendly = 'Invalid vehicle details provided. Please check and try again.';
      }
      return { success: false, message: friendly };
    }

    return { success: true, message: data.message || 'Vehicle registered successfully.' };
  } catch {
    return {
      success: false,
      message: 'Unable to connect to parking server. Please verify the backend is running.',
    };
  }
}

/**
 * Fetch all reservations, durations, and calculated fees.
 * Endpoint: GET /reservations
 */
export async function getReservations() {
  try {
    const res = await fetch(`${BASE_URL}/reservations`);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return {
        success: false,
        message: errData.message || errData.error || 'Failed to fetch reservations.',
      };
    }
    const data = await res.json();
    return { success: true, data: Array.isArray(data) ? data : [] };
  } catch {
    return {
      success: false,
      message: 'Unable to connect to parking server. Please verify the backend is running.',
    };
  }
}

/**
 * Release a parking slot using its reservation ID.
 * Endpoint: POST /release
 * Payload: { "reservationId": 1 }
 */
export async function releaseSlot(reservationId) {
  try {
    const res = await fetch(`${BASE_URL}/release`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        reservationId: Number(reservationId),
      }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.success === false) {
      let friendly = data.message || data.error || 'Slot release failed.';
      if (friendly.toLowerCase().includes('already ended')) {
        friendly = 'This reservation has already ended and the vehicle was previously released.';
      } else if (friendly.toLowerCase().includes('not found')) {
        friendly = 'Reservation not found. Please verify your reservation details.';
      } else if (friendly.toLowerCase().includes('invalid reservation')) {
        friendly = 'Invalid reservation ID specified.';
      }
      return { success: false, message: friendly };
    }

    return {
      success: true,
      message: data.message || 'Vehicle released successfully.',
    };
  } catch {
    return {
      success: false,
      message: 'Unable to connect to parking server. Please verify the backend is running.',
    };
  }
}

/**
 * Helper: Find active reservation matching a vehicle number.
 * Looks up /reservations and verifies against /slots that the slot is currently occupied.
 */
export async function findActiveReservation(vehicleNumber) {
  const [resListResult, slotsResult] = await Promise.all([
    getReservations(),
    getSlots(),
  ]);

  if (!resListResult.success) {
    return { success: false, message: resListResult.message };
  }
  if (!slotsResult.success) {
    return { success: false, message: slotsResult.message };
  }

  const reservations = resListResult.data;
  const slots = slotsResult.data;
  const normalizedPlate = vehicleNumber.trim().toUpperCase();

  // Find active reservations for this vehicle number where the slot is not available (still parked)
  const matchingActive = reservations.filter((r) => {
    const matchesPlate = r.vehicleNumber && r.vehicleNumber.trim().toUpperCase() === normalizedPlate;
    const slot = slots.find((s) => s.slotNumber === r.slotNumber);
    const isOccupied = slot ? !slot.available : false;
    return matchesPlate && isOccupied;
  });

  if (matchingActive.length === 0) {
    return {
      success: false,
      message: 'No active reservation was found for this vehicle.',
    };
  }

  // Return the latest active reservation
  return {
    success: true,
    reservation: matchingActive[matchingActive.length - 1],
  };
}
