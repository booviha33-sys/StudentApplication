package com.example.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.entity.Studententity;

public interface StudentRepository extends JpaRepository<Studententity, Long> {
}