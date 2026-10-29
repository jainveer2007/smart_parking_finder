package parking;

import java.util.ArrayList;

public class ParkingLot {

    private ArrayList<ParkingSlot> slots;                       //java ka vector
    private ArrayList<Reservation> reservations;
    private int nextReservationId;
    private double feePerHour;

    public ParkingLot(int totalSlots, double feePerHour) {

        this.slots = new ArrayList<>();
        this.reservations = new ArrayList<>();
        this.nextReservationId = 1;
        this.feePerHour = feePerHour;

        // create requied no. of parking slots

        for (int i=1; i<=totalSlots; i++) {

            slots.add(new ParkingSlot(i));
        }
    }


    public ParkingSlot findAvailableSlot() {

        for (ParkingSlot slot : slots) {

            if (slot.isAvailable()) {
                return slot;
            }
        }

        return null;
    }

    public ArrayList<ParkingSlot> getSlots() {
        return slots;
    }


        
    public boolean registerVehicle(Vehicle vehicle) {

        ParkingSlot slot = findAvailableSlot();

        if (slot != null) {
            slot.parkVehicle(vehicle);

            Reservation reservation = new Reservation(
                nextReservationId,
                vehicle,
                slot,
                feePerHour
            );

            reservations.add(reservation);
            System.out.println("reservation id:" + nextReservationId);

            nextReservationId++;

            return true;
        }
        else {
            System.out.println("no slots  are availabe right now .");
            return false;
        }
    }

    public ArrayList<Reservation> getReservations() {
        return reservations;
    }

    // Finds a reservation using its ID.

    public Reservation findReservation(int reservationId) {

        for (Reservation reservation : reservations) {

            if (reservation.getReservationId() == reservationId) {
                return reservation;
            }
        }

        return null;
    }


    
    public String releaseSlot(int reservationId) {

        Reservation reservation = findReservation(reservationId);

        if (reservation == null) {
            return "reservation not found";
        }

        ParkingSlot slot = reservation.getSlot();

        if (slot.isAvailable()) {
            return "this reservation has already ended";
        }

        reservation.recordExit();
        slot.removeVehicle();

        System.out.println("parking duration:"
            + reservation.calculateDuration() + " minutes");

        System.out.println("parking fee: "
            + reservation.calculateFee());

        return "vehicle released successfully";
    }


    public void displayAllSlots() {

        for (ParkingSlot slot : slots) {
            slot.displaySlotStatus();
            System.out.println();
        }
    }



    public void displayAllReservations() {

        if (reservations.isEmpty()) {
            System.out.println("No reservations found");
        }
        else {

            for (Reservation reservation : reservations) { 
                reservation.displayReservation();
                System.out.println();
            }
        }
    }
}
