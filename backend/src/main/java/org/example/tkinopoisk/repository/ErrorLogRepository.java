package org.example.tkinopoisk.repository;

import org.example.tkinopoisk.model.ErrorLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ErrorLogRepository extends JpaRepository<ErrorLog, Long> {
}
