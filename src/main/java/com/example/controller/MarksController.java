package com.example.controller;

import com.example.entity.Marks;
import com.example.Repository.MarksRepository;
import com.example.Repository.StudentRepository;
import com.example.Repository.CourseRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/marks")
public class MarksController {

    @Autowired
    private MarksRepository marksRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @GetMapping
    public List<Marks> getAllMarks() {
        return marksRepository.findAll();
    }

    @GetMapping("/{id}")
    public Marks getMarksById(@PathVariable int id) {
        return marksRepository.findById(id).orElse(null);
    }

    @PostMapping
    public Object createMarks(@RequestBody Marks marks) {

        if (!studentRepository.existsById(marks.getStudentId())) {
            return Map.of("message", "Student not found");
        }

        if (!courseRepository.existsById(marks.getCourseId())) {
            return Map.of("message", "Course not found");
        }

        if (marks.getMarks() < 0) {
            return Map.of("message", "Marks cannot be negative");
        }

        if (marks.getMarks() > marks.getTotalMarks()) {
            return Map.of("message", "Marks cannot be greater than total marks");
        }

        return marksRepository.save(marks);
    }

    @PutMapping("/{id}")
    public Object updateMarks(
            @PathVariable int id,
            @RequestBody Marks marks) {

        if (!studentRepository.existsById(marks.getStudentId())) {
            return Map.of("message", "Student not found");
        }

        if (!courseRepository.existsById(marks.getCourseId())) {
            return Map.of("message", "Course not found");
        }

        if (marks.getMarks() < 0) {
            return Map.of("message", "Marks cannot be negative");
        }

        if (marks.getMarks() > marks.getTotalMarks()) {
            return Map.of("message", "Marks cannot be greater than total marks");
        }

        marks.setMarkId(id);

        return marksRepository.save(marks);
    }

    @DeleteMapping("/{id}")
    public String deleteMarks(@PathVariable int id) {
        marksRepository.deleteById(id);
        return "Marks deleted successfully";
    }
}