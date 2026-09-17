package com.example.controller;

import com.example.entity.Enrollment;

import com.example.Repository.EnrollmentRepository;
import com.example.Repository.StudentRepository;
import com.example.Repository.CourseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/enrollments")
public class EnrollmentController {

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @PostMapping
    public Map<String, Object> createEnrollment(
            @RequestBody Enrollment enrollment) {

        if (!studentRepository.existsById(enrollment.getStudentId())) {
            return Map.of("message", "Student not found");
        }

        if (!courseRepository.existsById(enrollment.getCourseId())) {
            return Map.of("message", "Course not found");
        }

        List<Enrollment> existingEnrollments =
                enrollmentRepository.findByStudentIdAndCourseId(
                        enrollment.getStudentId(),
                        enrollment.getCourseId());

        if (!existingEnrollments.isEmpty()) {
            return Map.of("message", "Student already enrolled");
        }

        Enrollment savedEnrollment =
                enrollmentRepository.save(enrollment);

        return Map.of(
                "message", "Enrollment successful",
                "enrollment", savedEnrollment
        );
    }

    @GetMapping
    public List<Enrollment> getAllEnrollments() {
        return enrollmentRepository.findAll();
    }

    @GetMapping("/{id}")
    public Enrollment getEnrollmentById(@PathVariable int id) {
        return enrollmentRepository.findById(id).orElse(null);
    }

    @PutMapping("/{id}")
    public Enrollment updateEnrollment(
            @PathVariable int id,
            @RequestBody Enrollment enrollment) {

        enrollment.setEnrollmentId(id);
        return enrollmentRepository.save(enrollment);
    }

    @DeleteMapping("/{id}")
    public String deleteEnrollment(@PathVariable int id) {
        enrollmentRepository.deleteById(id);
        return "Enrollment deleted successfully";
    }
}