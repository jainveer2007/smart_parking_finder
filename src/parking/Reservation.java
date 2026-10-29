package parking;

import java.time.Duration;
import java.time.LocalDateTime;

public class Reservation {

    private int reservationId;
    private Vehicle vehicle;
    private ParkingSlot slot;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private double feePerHour;

    public Reservation(int reservationId, Vehicle vehicle,
                       ParkingSlot slot, double feePerHour) {

        this.reservationId = reservationId;
        this.vehicle = vehicle;
        this.slot = slot;
        this.entryTime = LocalDateTime.now();
        this.exitTime = null;
        this.feePerHour = feePerHour;
    }

    public int getReservationId() {
        return reservationId;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public ParkingSlot getSlot() {
        return slot;
    }

    public LocalDateTime getEntryTime() {
        return entryTime;
    }

    public LocalDateTime getExitTime() {
        return exitTime;
    }


    // Records the vehicle's exit time.
    public void recordExit() {
        this.exitTime = LocalDateTime.now();
    }


    public long calculateDuration() {

        LocalDateTime endTime;

        if (exitTime == null) {
            endTime = LocalDateTime.now();
        }
        else {
            endTime = exitTime;
        }

        return Duration.between(entryTime, endTime).toMinutes();
    }


    public double calculateFee() {

        long minutes = calculateDuration();
        long hours = (minutes + 59) / 60;

        return hours * feePerHour;
    }


    public void displayReservation() {

        System.out.println("Reservation Id: " + reservationId);
        System.out.println("Vehicle no.: " + vehicle.getVehicleNumber());
        System.out.println("Slot no.: " + slot.getSlotNumber());
        System.out.println("Entry Time: " + entryTime);

        if (exitTime != null) {
            System.out.println("Exit Time: " + exitTime);
        }
        else {
            System.out.println("Status: Vehicle still parked");
        }

        System.out.println("Duration:" + calculateDuration() + "min");
        System.out.println("Parking Fee:" + calculateFee());
    }
}