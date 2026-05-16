package org.example.tkinopoisk.service;

import org.example.tkinopoisk.model.User;
import org.example.tkinopoisk.model.UserMovieRating;
import org.example.tkinopoisk.repository.UserMovieRatingRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserMovieRatingService {

    private final UserMovieRatingRepository userMovieRatingRepository;

    public UserMovieRatingService(UserMovieRatingRepository userMovieRatingRepository) {
        this.userMovieRatingRepository = userMovieRatingRepository;
    }

    @Transactional
    public UserMovieRating setRating(User user, Long movieId, int rating) {
        validateMovieId(movieId);
        validateRating(rating);

        UserMovieRating row = userMovieRatingRepository
                .findByUser_IdAndMovieId(user.getId(), movieId)
                .orElseGet(() -> {
                    UserMovieRating created = new UserMovieRating();
                    created.setUser(user);
                    created.setMovieId(movieId);
                    return created;
                });
        row.setRating(rating);
        return userMovieRatingRepository.save(row);
    }

    @Transactional(readOnly = true)
    public UserMovieRating getRatingOrThrow(User user, Long movieId) {
        validateMovieId(movieId);
        return userMovieRatingRepository
                .findByUser_IdAndMovieId(user.getId(), movieId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Rating not set"));
    }

    @Transactional
    public void deleteRating(User user, Long movieId) {
        validateMovieId(movieId);
        userMovieRatingRepository
                .findByUser_IdAndMovieId(user.getId(), movieId)
                .ifPresent(userMovieRatingRepository::delete);
    }

    @Transactional(readOnly = true)
    public RatingStats getPublicStats(Long movieId) {
        validateMovieId(movieId);
        List<Object[]> rows = userMovieRatingRepository.aggregateByMovieId(movieId);
        if (rows == null || rows.isEmpty()) {
            return new RatingStats(null, 0L);
        }
        Object[] row = rows.get(0);
        if (row == null || row.length < 2) {
            return new RatingStats(null, 0L);
        }
        Number avgNum = (Number) row[0];
        long count = ((Number) row[1]).longValue();
        if (count == 0) {
            return new RatingStats(null, 0L);
        }
        double avg = avgNum.doubleValue();
        double rounded = Math.round(avg * 10.0) / 10.0;
        return new RatingStats(rounded, count);
    }

    public record RatingStats(Double average, long count) {}

    public record LeaderboardEntry(long movieId, double average, long count) {}

    @Transactional(readOnly = true)
    public List<LeaderboardEntry> getLeaderboard(String sort) {
        boolean ascending = "asc".equalsIgnoreCase(sort);
        List<Object[]> rows = ascending
                ? userMovieRatingRepository.findLeaderboardByAverageAsc()
                : userMovieRatingRepository.findLeaderboardByAverageDesc();
        return rows.stream().map(UserMovieRatingService::toLeaderboardEntry).toList();
    }

    private static LeaderboardEntry toLeaderboardEntry(Object[] row) {
        long movieId = ((Number) row[0]).longValue();
        double avg = ((Number) row[1]).doubleValue();
        long count = ((Number) row[2]).longValue();
        double rounded = Math.round(avg * 10.0) / 10.0;
        return new LeaderboardEntry(movieId, rounded, count);
    }

    private static void validateMovieId(Long movieId) {
        if (movieId == null || movieId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid movie id");
        }
    }

    private static void validateRating(int rating) {
        if (rating < 1 || rating > 10) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rating must be between 1 and 10");
        }
    }
}
