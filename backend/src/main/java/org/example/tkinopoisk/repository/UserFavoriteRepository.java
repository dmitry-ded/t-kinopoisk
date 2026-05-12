package org.example.tkinopoisk.repository;

import org.example.tkinopoisk.model.UserFavorite;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserFavoriteRepository extends JpaRepository<UserFavorite, Long> {

    Optional<UserFavorite> findByUser_IdAndMovieId(Long userId, Long movieId);

    boolean existsByUser_IdAndMovieId(Long userId, Long movieId);

    void deleteByUser_IdAndMovieId(Long userId, Long movieId);

    List<UserFavorite> findByUser_IdOrderByCreatedAtDesc(Long userId);
}
