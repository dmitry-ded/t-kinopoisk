package org.example.tkinopoisk.controller;

import org.example.tkinopoisk.model.MovieList;
import org.example.tkinopoisk.model.MovieListItem;
import org.example.tkinopoisk.model.User;
import org.example.tkinopoisk.repository.UserRepository;
import org.example.tkinopoisk.security.UserDetailsImpl;
import org.example.tkinopoisk.service.MovieListService;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.List;

@RestController
@RequestMapping
public class MovieListController {

    private final UserRepository userRepository;
    private final MovieListService movieListService;

    public MovieListController(UserRepository userRepository, MovieListService movieListService) {
        this.userRepository = userRepository;
        this.movieListService = movieListService;
    }

    public record CreateMovieListRequest(String title, String description, Boolean isPublic) {}

    public record PatchMovieListRequest(String title, String description, Boolean isPublic) {}

    public record AddMovieToListRequest(Long movieId) {}

    public record MovieListSummaryResponse(
            long id,
            long userId,
            String title,
            String description,
            boolean isPublic,
            Instant createdAt,
            Instant updatedAt,
            long itemCount) {}

    public record MovieListItemResponse(long movieId, int position, Instant addedAt) {}

    public record MovieListDetailResponse(
            long id,
            long userId,
            String title,
            String description,
            boolean isPublic,
            Instant createdAt,
            Instant updatedAt,
            List<MovieListItemResponse> items) {}

    public record CommunityUserResponse(long userId, String login, List<MovieListSummaryResponse> lists) {}

    @GetMapping("/api/community/lists")
    public List<CommunityUserResponse> getCommunityLists() {
        return movieListService.listPublicCommunityGroupedByUser().stream()
                .map(g -> new CommunityUserResponse(
                        g.userId(),
                        g.login(),
                        g.lists().stream()
                                .map(l -> toSummary(l, movieListService.countItems(l.getId())))
                                .toList()))
                .toList();
    }

    @GetMapping("/api/users/{userId}/movie-lists")
    public List<MovieListSummaryResponse> listListsForUser(
            @PathVariable Long userId,
            Authentication authentication) {
        User viewer = optionalCurrentUser(authentication);
        Long viewerId = viewer != null ? viewer.getId() : null;
        return movieListService.listForProfile(userId, viewerId).stream()
                .map(l -> toSummary(l, movieListService.countItems(l.getId())))
                .toList();
    }

    @GetMapping("/api/movie-lists")
    public List<MovieListSummaryResponse> listMyLists(Authentication authentication) {
        User user = requireCurrentUser(authentication);
        return movieListService.listMine(user).stream()
                .map(l -> toSummary(l, movieListService.countItems(l.getId())))
                .toList();
    }

    @PostMapping("/api/movie-lists")
    @ResponseStatus(HttpStatus.CREATED)
    public MovieListSummaryResponse createList(@RequestBody CreateMovieListRequest body, Authentication authentication) {
        User user = requireCurrentUser(authentication);
        if (body == null || body.title() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        MovieList saved = movieListService.create(user, body.title(), body.description(), body.isPublic());
        return toSummary(saved, 0);
    }

    @GetMapping("/api/movie-lists/{listId}")
    public MovieListDetailResponse getList(@PathVariable Long listId, Authentication authentication) {
        User viewer = optionalCurrentUser(authentication);
        MovieList list = movieListService.getForViewer(listId, viewer);
        List<MovieListItemResponse> items = movieListService.listItemsForViewer(listId, viewer).stream()
                .map(i -> new MovieListItemResponse(i.getMovieId(), i.getPosition(), i.getAddedAt()))
                .toList();
        return toDetail(list, items);
    }

    @PatchMapping("/api/movie-lists/{listId}")
    public MovieListSummaryResponse patchList(
            @PathVariable Long listId,
            @RequestBody PatchMovieListRequest body,
            Authentication authentication) {
        User user = requireCurrentUser(authentication);
        if (body == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "body is required");
        }
        MovieList updated = movieListService.update(user, listId, body.title(), body.description(), body.isPublic());
        return toSummary(updated, movieListService.countItems(updated.getId()));
    }

    @DeleteMapping("/api/movie-lists/{listId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteList(@PathVariable Long listId, Authentication authentication) {
        User user = requireCurrentUser(authentication);
        movieListService.delete(user, listId);
    }

    @PostMapping("/api/movie-lists/{listId}/movies")
    @ResponseStatus(HttpStatus.CREATED)
    public MovieListItemResponse addMovieToList(
            @PathVariable Long listId,
            @RequestBody AddMovieToListRequest body,
            Authentication authentication) {
        User user = requireCurrentUser(authentication);
        if (body == null || body.movieId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "movieId is required");
        }
        MovieListItem saved = movieListService.addMovie(user, listId, body.movieId());
        return new MovieListItemResponse(saved.getMovieId(), saved.getPosition(), saved.getAddedAt());
    }

    @DeleteMapping("/api/movie-lists/{listId}/movies/{movieId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeMovieFromList(
            @PathVariable Long listId,
            @PathVariable Long movieId,
            Authentication authentication) {
        User user = requireCurrentUser(authentication);
        movieListService.removeMovie(user, listId, movieId);
    }

    private MovieListSummaryResponse toSummary(MovieList list, long itemCount) {
        return new MovieListSummaryResponse(
                list.getId(),
                list.getUser().getId(),
                list.getTitle(),
                list.getDescription(),
                list.isPublic(),
                list.getCreatedAt(),
                list.getUpdatedAt(),
                itemCount);
    }

    private MovieListDetailResponse toDetail(MovieList list, List<MovieListItemResponse> items) {
        return new MovieListDetailResponse(
                list.getId(),
                list.getUser().getId(),
                list.getTitle(),
                list.getDescription(),
                list.isPublic(),
                list.getCreatedAt(),
                list.getUpdatedAt(),
                items);
    }

    private User requireCurrentUser(Authentication authentication) {
        User u = optionalCurrentUser(authentication);
        if (u == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Unauthorized");
        }
        return u;
    }

    private User optionalCurrentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetailsImpl principal)) {
            return null;
        }
        Long userId = principal.getUserId();
        if (userId == null) {
            return null;
        }
        return userRepository.findById(userId).orElse(null);
    }
}
