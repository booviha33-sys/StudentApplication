package com.example.controller;

import com.example.entity.Studententity;
import com.example.Repository.StudentRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/students")
public class StudentController {

    @Autowired
    private StudentRepository studentRepository;

    @GetMapping
    public List<Studententity> getAllStudents() {
        return studentRepository.findAll();
    }

    @GetMapping("/{id}")
    public Studententity getStudentById(@PathVariable Long id) {
        return studentRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Studententity addStudent(@RequestBody Studententity student) {
        return studentRepository.save(student);
    }

    @PutMapping("/{id}")
    public Studententity updateStudent(
            @PathVariable Long id,
            @RequestBody Studententity student) {

        student.setId(id);
        return studentRepository.save(student);
    }

    @DeleteMapping("/{id}")
    public String deleteStudent(@PathVariable Long id) {
        studentRepository.deleteById(id);
        return "Student deleted successfully";
    }
}