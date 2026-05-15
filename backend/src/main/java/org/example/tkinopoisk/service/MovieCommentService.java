package org.example.tkinopoisk.service;

import org.example.tkinopoisk.model.MovieComment;
import org.example.tkinopoisk.model.User;
import org.example.tkinopoisk.repository.MovieCommentRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class MovieCommentService {

    private static final int MAX_TEXT_LENGTH = 2000;

    private final MovieCommentRepository movieCommentRepository;

    public MovieCommentService(MovieCommentRepository movieCommentRepository) {
        this.movieCommentRepository = movieCommentRepository;
    }

    @Transactional(readOnly = true)
    public List<MovieComment> listByMovie(Long movieId) {
        validateMovieId(movieId);
        return movieCommentRepository.findByMovieIdWithUserOrderByCreatedDesc(movieId);
    }

    @Transactional
    public MovieComment create(User user, Long movieId, String text) {
        validateMovieId(movieId);
        String normalized = normalizeText(text);
        MovieComment comment = new MovieComment();
        comment.setUser(user);
        comment.setMovieId(movieId);
        comment.setText(normalized);
        return movieCommentRepository.save(comment);
    }

    @Transactional
    public MovieComment update(User user, Long movieId, Long commentId, String text) {
        MovieComment comment = getOwnedComment(user, movieId, commentId);
        comment.setText(normalizeText(text));
        return movieCommentRepository.save(comment);
    }

    @Transactional
    public void delete(User user, Long movieId, Long commentId) {
        MovieComment comment = getOwnedComment(user, movieId, commentId);
        movieCommentRepository.delete(comment);
    }

    private MovieComment getOwnedComment(User user, Long movieId, Long commentId) {
        validateMovieId(movieId);
        if (commentId == null || commentId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid comment id");
        }
        MovieComment comment = movieCommentRepository.findByIdAndMovieIdWithUser(commentId, movieId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Comment not found"));
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed to modify this comment");
        }
        return comment;
    }

    private static String normalizeText(String text) {
        if (text == null || text.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "text is required");
        }
        String trimmed = text.trim();
        if (trimmed.length() > MAX_TEXT_LENGTH) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "text too long");
        }
        return trimmed;
    }

    private static void validateMovieId(Long movieId) {
        if (movieId == null || movieId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid movie id");
        }
    }
}
