package org.example.tkinopoisk.repository;

import org.example.tkinopoisk.model.MovieListItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MovieListItemRepository extends JpaRepository<MovieListItem, Long> {

    boolean existsByList_IdAndMovieId(Long listId, Long movieId);

    Optional<MovieListItem> findByList_IdAndMovieId(Long listId, Long movieId);

    List<MovieListItem> findByList_IdOrderByPositionAscAddedAtAsc(Long listId);

    void deleteByList_IdAndMovieId(Long listId, Long movieId);

    @Query("select coalesce(max(i.position), 0) from MovieListItem i where i.list.id = :listId")
    int maxPositionByListId(@Param("listId") Long listId);

    long countByList_Id(Long listId);
}
