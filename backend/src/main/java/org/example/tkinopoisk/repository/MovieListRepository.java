package org.example.tkinopoisk.repository;

import org.example.tkinopoisk.model.MovieList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MovieListRepository extends JpaRepository<MovieList, Long> {

    @Query("select distinct l from MovieList l join fetch l.user where l.user.id = :userId and l.isPublic = true order by l.createdAt desc")
    List<MovieList> findPublicByUserIdOrderByCreated(@Param("userId") Long userId);

    @Query("select distinct l from MovieList l join fetch l.user where l.user.id = :userId order by l.createdAt desc")
    List<MovieList> findAllByUserIdOrderByCreated(@Param("userId") Long userId);

    @Query("select l from MovieList l join fetch l.user where l.id = :id and l.user.id = :userId")
    Optional<MovieList> findByIdAndUser_Id(@Param("id") Long id, @Param("userId") Long userId);

    @Query("select l from MovieList l join fetch l.user where l.id = :id")
    Optional<MovieList> findByIdWithUser(@Param("id") Long id);

    @Query("select l from MovieList l join fetch l.user u where l.isPublic = true order by u.id asc, l.createdAt desc")
    List<MovieList> findAllPublicWithUserOrderByUserListCreated();
}
