package org.example.tkinopoisk.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

@Entity
@Table(
        name = "movie_list_item",
        uniqueConstraints = @UniqueConstraint(columnNames = {"list_id", "movie_id"})
)
public class MovieListItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "list_id", nullable = false)
    private MovieList list;

    @Column(name = "movie_id", nullable = false)
    private Long movieId;

    @Column(nullable = false)
    private int position;

    @Column(name = "added_at", nullable = false)
    private Instant addedAt;

    public MovieListItem() {
    }

    @PrePersist
    void prePersist() {
        if (addedAt == null) {
            addedAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public MovieList getList() {
        return list;
    }

    public void setList(MovieList list) {
        this.list = list;
    }

    public Long getMovieId() {
        return movieId;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }

    public int getPosition() {
        return position;
    }

    public void setPosition(int position) {
        this.position = position;
    }

    public Instant getAddedAt() {
        return addedAt;
    }

    public void setAddedAt(Instant addedAt) {
        this.addedAt = addedAt;
    }
}
