package org.example.tkinopoisk.repository;

import org.example.tkinopoisk.model.UserMovieRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UserMovieRatingRepository extends JpaRepository<UserMovieRating, Long> {

    Optional<UserMovieRating> findByUser_IdAndMovieId(Long userId, Long movieId);

    @Query("select avg(r.rating), count(r) from UserMovieRating r where r.movieId = :movieId")
    List<Object[]> aggregateByMovieId(@Param("movieId") Long movieId);
}
