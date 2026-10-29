package parking;

import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;

public class Server {

    public static void main(String[] args) throws IOException {

        ParkingLot parkingLot = new ParkingLot(5, 30.0);

        HttpServer server = HttpServer.create(
            new InetSocketAddress(8080),
            0
        );

        server.createContext(
            "/",
            new HttpHandler(parkingLot)
        );

        server.start();

        System.out.println("server started at port 8080");
    }
}