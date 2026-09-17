package com.example.Repository;

import com.example.entity.AuthStudent;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuthStudentRepository extends JpaRepository<AuthStudent, Integer> {
}