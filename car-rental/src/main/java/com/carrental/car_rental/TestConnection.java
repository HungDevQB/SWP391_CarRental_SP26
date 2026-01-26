package com.carrental.car_rental;
import java.sql.Connection;
import java.sql.DriverManager;

public class TestConnection {
    public static void main(String[] args) {
        String url = "jdbc:sqlserver://localhost:1433;databaseName=CarRentalDB;encrypt=true;trustServerCertificate=true";
        String username = "sa";
        String password = "admin";

        try {
            Connection connection = DriverManager.getConnection(url, username, password);
            System.out.println("Kết nối thành công!");
            connection.close();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}