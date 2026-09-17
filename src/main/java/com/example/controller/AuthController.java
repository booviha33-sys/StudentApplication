package com.example.controller;

import com.example.entity.AuthStudent;
import com.example.Repository.AuthStudentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthStudentRepository authStudentRepository;

    // REGISTER
    @PostMapping("/register")
    public Map<String, String> register(@RequestBody AuthStudent student) {

        Map<String, String> response = new HashMap<>();

        List<AuthStudent> students = authStudentRepository.findAll();

        for (AuthStudent existingStudent : students) {

            if (existingStudent.getUsername()
                    .equalsIgnoreCase(student.getUsername())) {

                response.put("message", "Username already exists");
                return response;
            }
        }

        authStudentRepository.save(student);

        response.put("message", "Registration Successful");

        return response;
    }

    // LOGIN
    @PostMapping("/login")
    public Map<String, String> login(
            @RequestBody Map<String, String> loginData) {

        Map<String, String> response = new HashMap<>();

        String username = loginData.get("username");
        String password = loginData.get("password");

        List<AuthStudent> students = authStudentRepository.findAll();

        for (AuthStudent student : students) {

            if (student.getUsername().equals(username)) {

                if (!student.getPassword().equals(password)) {

                    response.put("message", "Invalid Password");
                    return response;
                }

                response.put("message", "Login Successful");
                response.put("studentName", student.getName());

                return response;
            }
        }

        response.put("message", "Username not found");

        return response;
    }
}