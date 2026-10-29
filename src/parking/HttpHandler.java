
package parking;

import com.google.gson.Gson;
import java.util.ArrayList;
import com.sun.net.httpserver.HttpExchange;
import java.io.IOException;

public class HttpHandler implements com.sun.net.httpserver.HttpHandler {

    private ParkingLot parkingLot;
    private Gson gson = new Gson();

    public HttpHandler(ParkingLot parkingLot) {
        this.parkingLot = parkingLot;
    }

    @Override
    public void handle(HttpExchange exchange) throws IOException {

    try {               

        String path = exchange.getRequestURI().getPath();
        String response = "";
        int status = 200;

        if (path.equals("/slots")) {

            StringBuilder result = new StringBuilder();
            result.append("[");

            ArrayList<ParkingSlot> slots = parkingLot.getSlots();

            for (int i = 0; i < slots.size(); i++) {

                ParkingSlot slot = slots.get(i);

                result.append("{");
                result.append("\"slotNumber\":").append(slot.getSlotNumber()).append(",");
                result.append("\"available\":").append(slot.isAvailable());
                result.append("}");

                if (i < slots.size() - 1) {
                    result.append(",");
                }
            }

            result.append("]");
            response = result.toString();
        }

        else if (path.equals("/register")
                && exchange.getRequestMethod().equals("POST")) {

            String body = new String(
                exchange.getRequestBody().readAllBytes(),
                java.nio.charset.StandardCharsets.UTF_8
            );

            VehicleRequest request = gson.fromJson(body, VehicleRequest.class);

            if (request == null || request.getVehicleNumber() == null
                    || request.getVehicleType() == null
                    || request.getVehicleNumber().isBlank()
                    || request.getVehicleType().isBlank()) {

                status = 400;
                response = "{\"success\":false,\"message\":\"invalid vehicle data\"}";
            }
            else {

                Vehicle vehicle = new Vehicle(
                    request.getVehicleNumber(),
                    request.getVehicleType()
                );

                boolean registered = parkingLot.registerVehicle(vehicle);

                if (registered) {
                    response = "{\"success\":true,\"message\":\"vehicle registered successfully\"}";
                }
                else {
                    status = 409;
                    response = "{\"success\":false,\"message\":\"no parking slots are available\"}";
                }
            }
        }

        else if (path.equals("/reservations")) {

            StringBuilder result = new StringBuilder();
            result.append("[");

            ArrayList<Reservation> reservations = parkingLot.getReservations();

            for (int i = 0; i < reservations.size(); i++) {

                Reservation reservation = reservations.get(i);

                result.append("{");
                result.append("\"reservationId\":").append(reservation.getReservationId()).append(",");
                result.append("\"vehicleNumber\":\"")
                    .append(reservation.getVehicle().getVehicleNumber()).append("\",");
                result.append("\"slotNumber\":")
                    .append(reservation.getSlot().getSlotNumber()).append(",");
                result.append("\"entryTime\":\"")
                    .append(reservation.getEntryTime()).append("\",");
                result.append("\"durationMinutes\":")
                    .append(reservation.calculateDuration()).append(",");
                result.append("\"fee\":")
                    .append(reservation.calculateFee());
                result.append("}");

                if (i < reservations.size() - 1) {
                    result.append(",");
                }
            }

            result.append("]");
            response = result.toString();
        }

    else if (path.equals("/release") && exchange.getRequestMethod().equals("POST")) {

        String body = new String(
            exchange.getRequestBody().readAllBytes(),
            java.nio.charset.StandardCharsets.UTF_8
        );

        ReleaseRequest request = gson.fromJson(body, ReleaseRequest.class);

        if (request == null || request.getReservationId() <= 0) {
            status = 400;
            response = "{\"success\":false,\"message\":\"invalid reservation id\"}";
        }
        else {
            String message = parkingLot.releaseSlot(request.getReservationId());

            if (message.equals("vehicle released successfully")) {
                response = "{\"success\":true,\"message\":\"vehicle released successfully\"}";
            }
            else {
                status = 409;
                response = "{\"success\":false,\"message\":\"" + message + "\"}";
            }
        }
    }

        else {
            status = 404;
            response = "{\"error\":\"endpoint not found\"}";
        }

        exchange.getResponseHeaders().set(
            "Content-Type", "application/json; charset=UTF-8"
        );

        exchange.getResponseHeaders().set(
            "Access-Control-Allow-Origin", "*"
        );

               byte[] data = response.getBytes(
            java.nio.charset.StandardCharsets.UTF_8
        );

        exchange.sendResponseHeaders(status, data.length);
        exchange.getResponseBody().write(data);
        exchange.getResponseBody().close();
    }
    catch (RuntimeException e) {
        String errorResponse =
            "{\"success\":false,\"message\":\"invalid request\"}";

        byte[] errorData = errorResponse.getBytes(
            java.nio.charset.StandardCharsets.UTF_8
        );

        exchange.getResponseHeaders().set(
            "Content-Type", "application/json; charset=UTF-8"
        );

        exchange.sendResponseHeaders(400, errorData.length);
        exchange.getResponseBody().write(errorData);
        exchange.getResponseBody().close();
        }
    }
}