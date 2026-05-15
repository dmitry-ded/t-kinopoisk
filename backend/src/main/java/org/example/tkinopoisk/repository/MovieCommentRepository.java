package org.example.tkinopoisk.repository;

import org.example.tkinopoisk.model.MovieComment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MovieCommentRepository extends JpaRepository<MovieComment, Long> {

    @Query("select c from MovieComment c join fetch c.user where c.movieId = :movieId order by c.createdAt desc")
    List<MovieComment> findByMovieIdWithUserOrderByCreatedDesc(@Param("movieId") Long movieId);

    @Query("select c from MovieComment c join fetch c.user where c.id = :id and c.movieId = :movieId")
    Optional<MovieComment> findByIdAndMovieIdWithUser(@Param("id") Long id, @Param("movieId") Long movieId);
}
