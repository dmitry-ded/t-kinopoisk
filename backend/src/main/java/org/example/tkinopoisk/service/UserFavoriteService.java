package org.example.tkinopoisk.service;

import org.example.tkinopoisk.model.User;
import org.example.tkinopoisk.model.UserFavorite;
import org.example.tkinopoisk.repository.UserFavoriteRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class UserFavoriteService {

    private final UserFavoriteRepository userFavoriteRepository;

    public UserFavoriteService(UserFavoriteRepository userFavoriteRepository) {
        this.userFavoriteRepository = userFavoriteRepository;
    }

    @Transactional
    public UserFavorite addFavorite(User user, Long movieId) {
        validateMovieId(movieId);
        if (userFavoriteRepository.existsByUser_IdAndMovieId(user.getId(), movieId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Already in favorites");
        }
        UserFavorite favorite = new UserFavorite();
        favorite.setUser(user);
        favorite.setMovieId(movieId);
        return userFavoriteRepository.save(favorite);
    }

    @Transactional
    public void removeFavorite(User user, Long movieId) {
        validateMovieId(movieId);
        if (!userFavoriteRepository.existsByUser_IdAndMovieId(user.getId(), movieId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Not in favorites");
        }
        userFavoriteRepository.deleteByUser_IdAndMovieId(user.getId(), movieId);
    }

    @Transactional(readOnly = true)
    public List<UserFavorite> listFavorites(User user) {
        return userFavoriteRepository.findByUser_IdOrderByCreatedAtDesc(user.getId());
    }

    private static void validateMovieId(Long movieId) {
        if (movieId == null || movieId <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid movie id");
        }
    }
}
