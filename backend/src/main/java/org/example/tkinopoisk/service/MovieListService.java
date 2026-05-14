package org.example.tkinopoisk.service;

import org.example.tkinopoisk.model.MovieList;
import org.example.tkinopoisk.model.MovieListItem;
import org.example.tkinopoisk.model.User;
import org.example.tkinopoisk.repository.MovieListItemRepository;
import org.example.tkinopoisk.repository.MovieListRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class MovieListService {

    public record CommunityUserGroup(long userId, String login, List<MovieList> lists) {}

    private final MovieListRepository movieListRepository;
    private final MovieListItemRepository movieListItemRepository;

    public MovieListService(MovieListRepository movieListRepository, MovieListItemRepository movieListItemRepository) {
        this.movieListRepository = movieListRepository;
        this.movieListItemRepository = movieListItemRepository;
    }

    @Transactional(readOnly = true)
    public List<MovieList> listForProfile(Long ownerUserId, Long viewerUserId) {
        if (viewerUserId != null && viewerUserId.equals(ownerUserId)) {
            return movieListRepository.findAllByUserIdOrderByCreated(ownerUserId);
        }
        return movieListRepository.findPublicByUserIdOrderByCreated(ownerUserId);
    }

    @Transactional(readOnly = true)
    public List<MovieList> listMine(User user) {
        return movieListRepository.findAllByUserIdOrderByCreated(user.getId());
    }

    /**
     * Все пользователи, у которых есть хотя бы один публичный список, с полным списком их публичных подборок.
     */
    @Transactional(readOnly = true)
    public List<CommunityUserGroup> listPublicCommunityGroupedByUser() {
        List<MovieList> rows = movieListRepository.findAllPublicWithUserOrderByUserListCreated();
        Map<Long, List<MovieList>> byUser = new LinkedHashMap<>();
        for (MovieList list : rows) {
            Long uid = list.getUser().getId();
            byUser.computeIfAbsent(uid, k -> new ArrayList<>()).add(list);
        }
        List<CommunityUserGroup> out = new ArrayList<>();
        for (List<MovieList> lists : byUser.values()) {
            if (lists.isEmpty()) {
                continue;
            }
            User u = lists.get(0).getUser();
            out.add(new CommunityUserGroup(u.getId(), u.getLogin(), lists));
        }
        return out;
    }

    @Transactional(readOnly = true)
    public MovieList getForViewer(Long listId, User viewerOrNull) {
        MovieList list = movieListRepository.findByIdWithUser(listId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));
        boolean owner = viewerOrNull != null && viewerOrNull.getId().equals(list.getUser().getId());
        if (!list.isPublic() && !owner) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found");
        }
        return list;
    }

    @Transactional(readOnly = true)
    public List<MovieListItem> listItemsForViewer(Long listId, User viewerOrNull) {
        getForViewer(listId, viewerOrNull);
        return movieListItemRepository.findByList_IdOrderByPositionAscAddedAtAsc(listId);
    }

    @Transactional
    public MovieList create(User user, String title, String description, Boolean isPublic) {
        validateTitle(title);
        MovieList list = new MovieList();
        list.setUser(user);
        list.setTitle(title.trim());
        list.setDescription(blankToNull(description));
        list.setPublic(Boolean.TRUE.equals(isPublic));
        return movieListRepository.save(list);
    }

    @Transactional
    public MovieList update(User user, Long listId, String title, String description, Boolean isPublic) {
        MovieList list = movieListRepository.findByIdAndUser_Id(listId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));
        if (title != null) {
            validateTitle(title);
            list.setTitle(title.trim());
        }
        if (description != null) {
            list.setDescription(blankToNull(description));
        }
        if (isPublic != null) {
            list.setPublic(isPublic);
        }
        return movieListRepository.save(list);
    }

    @Transactional
    public void delete(User user, Long listId) {
        MovieList list = movieListRepository.findByIdAndUser_Id(listId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));
        movieListRepository.delete(list);
    }

    @Transactional
    public MovieListItem addMovie(User user, Long listId, Long movieId) {
        validateMovieId(movieId);
        MovieList list = movieListRepository.findByIdAndUser_Id(listId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));
        if (movieListItemRepository.existsByList_IdAndMovieId(listId, movieId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Movie already in list");
        }
        int nextPosition = movieListItemRepository.maxPositionByListId(listId) + 1;
        MovieListItem item = new MovieListItem();
        item.setList(list);
        item.setMovieId(movieId);
        item.setPosition(nextPosition);
        try {
            return movieListItemRepository.save(item);
        } catch (DataIntegrityViolationException e) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Movie already in list", e);
        }
    }

    @Transactional
    public void removeMovie(User user, Long listId, Long movieId) {
        validateMovieId(movieId);
        movieListRepository.findByIdAndUser_Id(listId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "List not found"));
        if (!movieListItemRepository.existsByList_IdAndMovieId(listId, movieId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Movie not in list");
        }
        movieListItemRepository.deleteByList_IdAndMovieId(listId, movieId);
    }

    @Transactional(readOnly = true)
    public long countItems(Long listId) {
        return movieListItemRepository.countByList_Id(listId);
    }

    private static void validateTitle(String title) {
        if (title == null || title.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title is required");
        }
        if (title.length() > 255) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "title too long");
        }
    }

    private static void validateMovieId(Long movieId) {
        if (movieId == null || movieId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid movie id");
        }
    }

    private static String blankToNull(String s) {
        if (s == null || s.isBlank()) {
            return null;
        }
        return s.trim();
    }
}
