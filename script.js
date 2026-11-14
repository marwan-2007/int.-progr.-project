// =========================================================
// 1. Storage Keys & Data Helper Functions
// =========================================================
const MOVIES_STORAGE_KEY = "watchLogMovies";
const SELECTED_MOVIE_KEY = "selectedMovieId";

// Retrieves the movies array from localStorage or seeds initial sample data
function getMovies() {
    const storedData = localStorage.getItem(MOVIES_STORAGE_KEY);

    // Seed sample movies only on the very first visit (when key is null)
    if (storedData === null) {
        const initialMovies = [
            {
                id: 1700000000001,
                title: "Inception",
                genre: "Sci-Fi",
                releaseYear: 2010,
                rating: 9,
                watchDate: "2026-10-15",
                notes: "A layered sci-fi thriller exploring shared dreaming and subconscious architecture."
            },
            {
                id: 1700000000002,
                title: "The Dark Knight",
                genre: "Action",
                releaseYear: 2008,
                rating: 10,
                watchDate: "2026-10-22",
                notes: "Outstanding pacing, intense atmosphere, and unforgettable performances."
            },
            {
                id: 1700000000003,
                title: "Interstellar",
                genre: "Sci-Fi",
                releaseYear: 2014,
                rating: 9,
                watchDate: "2026-11-02",
                notes: "Emotional story combined with remarkable space visuals and musical score."
            }
        ];
        saveMovies(initialMovies);
        return initialMovies;
    }

    return JSON.parse(storedData);
}

// Saves the updated movies array as a JSON string in localStorage
function saveMovies(moviesArray) {
    localStorage.setItem(MOVIES_STORAGE_KEY, JSON.stringify(moviesArray));
}

// =========================================================
// 2. Main Execution After DOM Content Loads
// =========================================================
document.addEventListener("DOMContentLoaded", function () {
    const movies = getMovies();

    // ---------------------------------------------------------
    // A. Form Page Logic & Custom Validation (form.html)
    // ---------------------------------------------------------
    const movieForm = document.getElementById("movieForm");

    if (movieForm) {
        // Clear all inline validation error messages
        function clearErrors() {
            const errorElements = document.querySelectorAll(".error-msg");
            errorElements.forEach(function (el) {
                el.textContent = "";
            });
        }

        // Clear error messages when the user clicks the Reset button
        movieForm.addEventListener("reset", function () {
            clearErrors();
        });

        // Handle form submission and validate every field
        movieForm.addEventListener("submit", function (event) {
            event.preventDefault();
            clearErrors();

            const titleInput = document.getElementById("movieTitle").value.trim();
            const genreInput = document.getElementById("movieGenre").value;
            const yearInput = parseInt(document.getElementById("releaseYear").value, 10);
            const ratingInput = parseInt(document.getElementById("movieRating").value, 10);
            const dateInput = document.getElementById("watchDate").value;
            const notesInput = document.getElementById("movieNotes").value.trim();

            let isValid = true;

            // Validate Movie Title
            if (titleInput === "") {
                document.getElementById("titleError").textContent = "Please enter the movie title.";
                isValid = false;
            }

            // Validate Genre Selection
            if (genreInput === "") {
                document.getElementById("genreError").textContent = "Please select a genre.";
                isValid = false;
            }

            // Validate Release Year
            if (isNaN(yearInput) || yearInput < 1900 || yearInput > 2026) {
                document.getElementById("yearError").textContent = "Enter a valid year between 1900 and 2026.";
                isValid = false;
            }

            // Validate Rating (1 to 10)
            if (isNaN(ratingInput) || ratingInput < 1 || ratingInput > 10) {
                document.getElementById("ratingError").textContent = "Rating must be between 1 and 10.";
                isValid = false;
            }

            // Validate Watch Date
            if (dateInput === "") {
                document.getElementById("dateError").textContent = "Please select the date you watched this movie.";
                isValid = false;
            }

            // Validate Personal Notes
            if (notesInput.length < 5) {
                document.getElementById("notesError").textContent = "Notes must contain at least 5 characters.";
                isValid = false;
            }

            // Stop execution if any field failed validation
            if (!isValid) {
                return;
            }

            // Build new movie object
            const newMovie = {
                id: Date.now(),
                title: titleInput,
                genre: genreInput,
                releaseYear: yearInput,
                rating: ratingInput,
                watchDate: dateInput,
                notes: notesInput
            };

            // Add movie to list, persist in storage, and redirect to archive
            movies.push(newMovie);
            saveMovies(movies);
            localStorage.setItem(SELECTED_MOVIE_KEY, newMovie.id);

            window.location.href = "index.html";
        });
    }

    // ---------------------------------------------------------
    // B. Archive Page Logic: Dynamic Cards, Search & Filter (index.html)
    // ---------------------------------------------------------
    const movieListContainer = document.getElementById("movie-list");
    const searchInput = document.getElementById("searchInput");
    const genreFilter = document.getElementById("genreFilter");

    if (movieListContainer) {
        // Render an array of movie objects into responsive grid cards
        function renderMovieCards(movieArray) {
            movieListContainer.innerHTML = "";

            if (movieArray.length === 0) {
                const emptyMsg = document.createElement("p");
                emptyMsg.className = "empty-message";
                emptyMsg.style.gridColumn = "1 / -1";
                emptyMsg.textContent = "No matching movies found in your archive.";
                movieListContainer.appendChild(emptyMsg);
                return;
            }

            movieArray.forEach(function (movie) {
                const card = document.createElement("article");
                card.className = "movie-card";

                const titleEl = document.createElement("h3");
                titleEl.textContent = movie.title + " (" + movie.releaseYear + ")";

                const infoEl = document.createElement("p");
                infoEl.innerHTML = "<strong>Genre:</strong> " + movie.genre + "<br>" +
                                   "<strong>Rating:</strong> " + movie.rating + " / 10<br>" +
                                   "<strong>Watched:</strong> " + movie.watchDate;

                const linkEl = document.createElement("a");
                linkEl.href = "detail.html?id=" + movie.id;
                linkEl.className = "view-btn";
                linkEl.textContent = "View Details & Notes";

                card.appendChild(titleEl);
                card.appendChild(infoEl);
                card.appendChild(linkEl);
                movieListContainer.appendChild(card);
            });
        }

        // Filter movies dynamically based on search text and selected genre
        function filterMovies() {
            const query = searchInput ? searchInput.value.toLowerCase().trim() : "";
            const selectedGenre = genreFilter ? genreFilter.value : "all";

            const filtered = movies.filter(function (movie) {
                const matchesTitle = movie.title.toLowerCase().includes(query);
                const matchesGenre = selectedGenre === "all" || movie.genre === selectedGenre;
                return matchesTitle && matchesGenre;
            });

            renderMovieCards(filtered);
        }

        if (searchInput) {
            searchInput.addEventListener("input", filterMovies);
        }

        if (genreFilter) {
            genreFilter.addEventListener("change", filterMovies);
        }

        // Initial render on page load
        renderMovieCards(movies);
    }

    // ---------------------------------------------------------
    // C. Detail Page Logic: URL Params, Display & Delete (detail.html)
    // ---------------------------------------------------------
    const detailContent = document.getElementById("detail-content");
    const emptyState = document.getElementById("empty-state");
    const deleteMovieBtn = document.getElementById("deleteMovieBtn");

    if (detailContent && emptyState) {
        const urlParams = new URLSearchParams(window.location.search);
        const idFromUrl = urlParams.get("id");
        const targetId = idFromUrl || localStorage.getItem(SELECTED_MOVIE_KEY);

        if (targetId) {
            const selectedMovie = movies.find(function (m) {
                return String(m.id) === String(targetId);
            });

            if (selectedMovie) {
                // Save as most recently viewed movie
                localStorage.setItem(SELECTED_MOVIE_KEY, selectedMovie.id);

                // Toggle visibility classes
                emptyState.classList.add("hidden");
                detailContent.classList.remove("hidden");

                // Inject movie details into the DOM
                document.getElementById("detailTitle").textContent = selectedMovie.title;
                document.getElementById("detailGenre").textContent = selectedMovie.genre;
                document.getElementById("detailYear").textContent = selectedMovie.releaseYear;
                document.getElementById("detailRating").textContent = selectedMovie.rating;
                document.getElementById("detailDate").textContent = selectedMovie.watchDate;
                document.getElementById("detailNotes").textContent = selectedMovie.notes;

                // Handle movie deletion
                if (deleteMovieBtn) {
                    deleteMovieBtn.addEventListener("click", function () {
                        const confirmed = confirm("Are you sure you want to delete \"" + selectedMovie.title + "\"?");
                        if (confirmed) {
                            const updatedMovies = movies.filter(function (m) {
                                return String(m.id) !== String(selectedMovie.id);
                            });
                            saveMovies(updatedMovies);
                            localStorage.removeItem(SELECTED_MOVIE_KEY);
                            window.location.href = "index.html";
                        }
                    });
                }
            }
        }
    }

    // ---------------------------------------------------------
    // D. Statistics & Table Page Logic (table.html)
    // ---------------------------------------------------------
    const tableBody = document.getElementById("tableBody");
    const totalMoviesEl = document.getElementById("totalMovies");
    const averageRatingEl = document.getElementById("averageRating");
    const topGenreEl = document.getElementById("topGenre");
    const emptyTableMsg = document.getElementById("emptyTableMsg");

    if (tableBody) {
        tableBody.innerHTML = "";

        if (movies.length === 0) {
            if (emptyTableMsg) {
                emptyTableMsg.classList.remove("hidden");
            }
            if (totalMoviesEl) totalMoviesEl.textContent = "0";
            if (averageRatingEl) averageRatingEl.textContent = "0.0";
            if (topGenreEl) topGenreEl.textContent = "-";
        } else {
            if (emptyTableMsg) {
                emptyTableMsg.classList.add("hidden");
            }

            let totalRating = 0;
            const genreCounts = {};

            movies.forEach(function (movie) {
                totalRating += Number(movie.rating);
                genreCounts[movie.genre] = (genreCounts[movie.genre] || 0) + 1;

                // Create table row and cells dynamically
                const row = document.createElement("tr");

                const titleCell = document.createElement("td");
                titleCell.textContent = movie.title;

                const genreCell = document.createElement("td");
                genreCell.textContent = movie.genre;

                const yearCell = document.createElement("td");
                yearCell.textContent = movie.releaseYear;

                const dateCell = document.createElement("td");
                dateCell.textContent = movie.watchDate;

                const ratingCell = document.createElement("td");
                ratingCell.textContent = movie.rating + " / 10";

                const actionCell = document.createElement("td");
                const inspectLink = document.createElement("a");
                inspectLink.href = "detail.html?id=" + movie.id;
                inspectLink.textContent = "Inspect";
                actionCell.appendChild(inspectLink);

                row.appendChild(titleCell);
                row.appendChild(genreCell);
                row.appendChild(yearCell);
                row.appendChild(dateCell);
                row.appendChild(ratingCell);
                row.appendChild(actionCell);

                tableBody.appendChild(row);
            });

            // Calculate most watched genre
            let favoriteGenre = "-";
            let maxCount = 0;
            for (const genre in genreCounts) {
                if (genreCounts[genre] > maxCount) {
                    maxCount = genreCounts[genre];
                    favoriteGenre = genre;
                }
            }

            // Update summary cards
            if (totalMoviesEl) {
                totalMoviesEl.textContent = movies.length;
            }
            if (averageRatingEl) {
                averageRatingEl.textContent = (totalRating / movies.length).toFixed(1);
            }
            if (topGenreEl) {
                topGenreEl.textContent = favoriteGenre;
            }
        }
    }
});