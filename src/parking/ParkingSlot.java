package parking;

public class ParkingSlot {

    private int slotNumber;
    private boolean isAvailable;
    private Vehicle vehicle;

    public ParkingSlot(int slotNumber) {
        this.slotNumber = slotNumber;
        this.isAvailable = true;
        this.vehicle = null;
    }

    public int getSlotNumber() {
        return slotNumber;
    }

    public boolean isAvailable() {
        return isAvailable;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }


    public void parkVehicle(Vehicle vehicle) {
        if (isAvailable) {
            this.vehicle = vehicle;
            this.isAvailable = false;
            System.out.println("Vehicle parked in slot" + slotNumber);
        }
        else {
            System.out.println("Slot" + slotNumber + "is already occupied.");
        }
    }


    public void removeVehicle() {
        if (!isAvailable) {
            this.vehicle = null;
            this.isAvailable = true;
            System.out.println("Slot" + slotNumber + "is now available.");
        }
        else {
            System.out.println("Slot" + slotNumber + "is already empty.");
        }
    }


    public void displaySlotStatus() {

        System.out.println("Slot Number: " + slotNumber);

        if (isAvailable) {
            System.out.println("Status: Available");
        }
        else {
            System.out.println("Status: Occupied");
            System.out.println("Vehicle Number: " + vehicle.getVehicleNumber());
        }
    }
}
