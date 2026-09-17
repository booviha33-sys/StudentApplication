package com.example.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class AuthStudent {

    @Id
    private int id;

    private String name;
    private String department;
    private int age;
    private String username;
    private String password;

    // Default constructor
    public AuthStudent() {
    }

    // Parameterized constructor
    public AuthStudent(int id, String name, String department, int age,
                       String username, String password) {
        this.id = id;
        this.name = name;
        this.department = department;
        this.age = age;
        this.username = username;
        this.password = password;
    }

    // Getters and Setters

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}