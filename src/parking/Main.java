package parking;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {

        Scanner sc = new Scanner(System.in);
        ParkingLot parkingLot = new ParkingLot(5, 30.0);

        int choice = 0;

        while (choice != 6) {

            System.out.println("Choose the no. from following");

            System.out.println("1 -> Register vehicle");
            System.out.println("2 -> Find available slots");
            System.out.println("3 -> show all the slot Status");
            System.out.println("4 -> release the slot");
            System.out.println("5 -> display the  Reserved slots");
            System.out.println("6 -> exit");

            System.out.print("Enter choice: ");

            try {
                choice = sc.nextInt();
                sc.nextLine();
            }
            catch (java.util.InputMismatchException e) {
                System.out.println("invalid input");
                sc.nextLine();
                continue;
            }


            if (choice == 1) {

                System.out.print("enter vehicle no.: ");
                String vehicleNumber = sc.nextLine().trim();

                System.out.print("enter vehicle type (car or bike): ");
                String vehicleType = sc.nextLine().trim();

                if (vehicleNumber.isEmpty() || vehicleType.isEmpty()) {
                    System.out.println("veheicle no. and TYpe cannot be empty.");
                }
                else if (!vehicleType.equalsIgnoreCase("Car")
                        && !vehicleType.equalsIgnoreCase("bike")) {
                    System.out.println("invlid");
                }
                else {
                    Vehicle vehicle = new Vehicle(vehicleNumber, vehicleType);
                    parkingLot.registerVehicle(vehicle);
                }

            }
            else if (choice == 2) {

                ParkingSlot slot = parkingLot.findAvailableSlot();

                if (slot != null) {
                    System.out.println("Available Slot no: " + slot.getSlotNumber());  // encapsultion used heree
                }
                else {
                    System.out.println("No slots are available.");
                }
            }
            else if (choice == 3) {

                parkingLot.displayAllSlots();
            }
            else if (choice == 4) {

                System.out.print("Enter reservation ID: ");
                int reservationId = sc.nextInt();

                parkingLot.releaseSlot(reservationId);
            }
            else if (choice == 5) {

                parkingLot.displayAllReservations();
            }
            else if (choice == 6) {

                System.out.println("Exiting Smart Parking Finder...");
            }
            else {

                System.out.println("Invalid choice. Try again.");
            }
        }

        sc.close();
    }
}