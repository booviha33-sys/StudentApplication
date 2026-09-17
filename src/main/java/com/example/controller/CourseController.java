package com.example.controller;

import com.example.entity.Course;
import com.example.Repository.CourseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/courses")
public class CourseController {

    @Autowired
    private CourseRepository courseRepository;

    // Get all courses
    @GetMapping
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    // Get course by ID
    @GetMapping("/{id}")
    public Course getCourseById(@PathVariable int id) {
        return courseRepository.findById(id).orElse(null);
    }

    // Create new course
    @PostMapping
    public Course createCourse(@RequestBody Course course) {
        return courseRepository.save(course);
    }

    // Update existing course
    @PutMapping("/{id}")
    public Course updateCourse(
            @PathVariable int id,
            @RequestBody Course course) {

        course.setCourseId(id);
        return courseRepository.save(course);
    }

    // Delete course
    @DeleteMapping("/{id}")
    public String deleteCourse(@PathVariable int id) {
        courseRepository.deleteById(id);
        return "Course deleted successfully";
    }
}