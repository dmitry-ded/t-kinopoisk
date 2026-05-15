package org.example.tkinopoisk.controller;

import org.example.tkinopoisk.model.MovieComment;
import org.example.tkinopoisk.model.User;
import org.example.tkinopoisk.model.UserFavorite;
import org.example.tkinopoisk.model.UserMovieRating;
import org.example.tkinopoisk.repository.UserRepository;
import org.example.tkinopoisk.security.UserDetailsImpl;
import org.example.tkinopoisk.service.MovieCommentService;
import org.example.tkinopoisk.service.UserFavoriteService;
import org.example.tkinopoisk.service.UserMovieRatingService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping("/api/movies")
public class MovieController {

    private final UserRepository userRepository;
    private final UserFavoriteService userFavoriteService;
    private final UserMovieRatingService userMovieRatingService;
    private final MovieCommentService movieCommentService;

    public record FavoriteResponse(long movieId, Instant createdAt) {}

    public record SetRatingRequest(Integer rating) {}

    public record RatingResponse(long movieId, int rating) {}

    public record CommentResponse(
            long id,
            long movieId,
            long userId,
            String authorLogin,
            String text,
            Instant createdAt,
            Instant updatedAt) {}

    public record CommentTextRequest(String text) {}

    public MovieController(
            UserRepository userRepository,
            UserFavoriteService userFavoriteService,
            UserMovieRatingService userMovieRatingService,
            MovieCommentService movieCommentService) {
        this.userRepository = userRepository;
        this.userFavoriteService = userFavoriteService;
        this.userMovieRatingService = userMovieRatingService;
        this.movieCommentService = movieCommentService;
    }

    @PostMapping("/{movieId}/favorite")
    @ResponseStatus(HttpStatus.CREATED)
    public FavoriteResponse addFavorite(@PathVariable Long movieId, Authentication authentication) {
        User user = requireCurrentUser(authentication);
        UserFavorite saved = userFavoriteService.addFavorite(user, movieId);
        return new FavoriteResponse(saved.getMovieId(), saved.getCreatedAt());
    }

    @DeleteMapping("/{movieId}/favorite")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeFavorite(@PathVariable Long movieId, Authentication authentication) {
        User user = requireCurrentUser(authentication);
        userFavoriteService.removeFavorite(user, movieId);
    }

    @GetMapping("/favorites")
    public List<FavoriteResponse> listFavorites(Authentication authentication) {
        User user = requireCurrentUser(authentication);
        return userFavoriteService.listFavorites(user).stream()
                .map(f -> new FavoriteResponse(f.getMovieId(), f.getCreatedAt()))
                .toList();
    }

    public record RatingStatsResponse(Double average, long count) {}

    @GetMapping("/{movieId}/rating/stats")
    public RatingStatsResponse getRatingStats(@PathVariable Long movieId) {
        var s = userMovieRatingService.getPublicStats(movieId);
        return new RatingStatsResponse(s.average(), s.count());
    }

    @PutMapping("/{movieId}/rating")
    public RatingResponse putRating(
            @PathVariable Long movieId,
            @RequestBody SetRatingRequest body,
            Authentication authentication) {
        User user = requireCurrentUser(authentication);
        if (body == null || body.rating() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "rating is required");
        }
        UserMovieRating saved = userMovieRatingService.setRating(user, movieId, body.rating());
        return new RatingResponse(saved.getMovieId(), saved.getRating());
    }

    @GetMapping("/{movieId}/rating")
    public RatingResponse getRating(@PathVariable Long movieId, Authentication authentication) {
        User user = requireCurrentUser(authentication);
        UserMovieRating row = userMovieRatingService.getRatingOrThrow(user, movieId);
        return new RatingResponse(row.getMovieId(), row.getRating());
    }

    @DeleteMapping("/{movieId}/rating")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteRating(@PathVariable Long movieId, Authentication authentication) {
        User user = requireCurrentUser(authentication);
        userMovieRatingService.deleteRating(user, movieId);
    }

    @GetMapping("/{movieId}/comments")
    public List<CommentResponse> listComments(@PathVariable Long movieId) {
        return movieCommentService.listByMovie(movieId).stream()
                .map(this::toCommentResponse)
                .toList();
    }

    @PostMapping("/{movieId}/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public CommentResponse createComment(
            @PathVariable Long movieId,
            @RequestBody CommentTextRequest body,
            Authentication authentication) {
        User user = requireCurrentUser(authentication);
        if (body == null || body.text() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "text is required");
        }
        MovieComment saved = movieCommentService.create(user, movieId, body.text());
        return toCommentResponse(saved);
    }

    @PatchMapping("/{movieId}/comments/{commentId}")
    public CommentResponse patchComment(
            @PathVariable Long movieId,
            @PathVariable Long commentId,
            @RequestBody CommentTextRequest body,
            Authentication authentication) {
        User user = requireCurrentUser(authentication);
        if (body == null || body.text() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "text is required");
        }
        MovieComment updated = movieCommentService.update(user, movieId, commentId, body.text());
        return toCommentResponse(updated);
    }

    @DeleteMapping("/{movieId}/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(
            @PathVariable Long movieId,
            @PathVariable Long commentId,
            Authentication authentication) {
        User user = requireCurrentUser(authentication);
        movieCommentService.delete(user, movieId, commentId);
    }

    private CommentResponse toCommentResponse(MovieComment comment) {
        return new CommentResponse(
                comment.getId(),
                comment.getMovieId(),
                comment.getUser().getId(),
                comment.getUser().getLogin(),
                comment.getText(),
                comment.getCreatedAt(),
                comment.getUpdatedAt());
    }

    private User requireCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl principal)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        Long userId = principal.getUserId();
        if (userId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }
}
