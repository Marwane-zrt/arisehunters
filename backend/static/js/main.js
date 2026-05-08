document.addEventListener("DOMContentLoaded", function () {
    const starContainers = document.querySelectorAll('.star-rating');

    if (starContainers.length > 0) {
        starContainers.forEach(container => {
            const stars = container.querySelectorAll('i');
            const hiddenInput = document.getElementById('id_rating');

            // 1. Initialiser l'état selon la valeur déjà existante (édition)
            if (hiddenInput && hiddenInput.value) {
                const initVal = parseInt(hiddenInput.value);
                stars.forEach(s => {
                    if (parseInt(s.getAttribute('data-value')) <= initVal) {
                        s.classList.remove('bi-star');
                        s.classList.add('bi-star-fill', 'active-gold');
                    }
                });
            }

            stars.forEach(star => {
                // Événement Hover : Afficher visuellement
                star.addEventListener('mouseenter', function () {
                    const value = parseInt(this.getAttribute('data-value'));
                    stars.forEach(s => {
                        if (parseInt(s.getAttribute('data-value')) <= value) {
                            s.classList.add('hover-gold');
                            s.classList.replace('bi-star', 'bi-star-fill');
                        }
                    });
                });

                // En quittant le Hover : Revenir à l'état cliqué officiel
                star.addEventListener('mouseleave', function () {
                    stars.forEach(s => {
                        s.classList.remove('hover-gold');
                        // Si pas actif, remettre l'étoile vide
                        if (!s.classList.contains('active-gold')) {
                            s.classList.replace('bi-star-fill', 'bi-star');
                        }
                    });
                });

                // Événement Clic : Sauvegarder dans le champ caché
                star.addEventListener('click', function () {
                    const value = parseInt(this.getAttribute('data-value'));
                    if (hiddenInput) {
                        hiddenInput.value = value;
                    }

                    // Figer visuellement l'état
                    stars.forEach(s => {
                        if (parseInt(s.getAttribute('data-value')) <= value) {
                            s.classList.remove('bi-star');
                            s.classList.add('bi-star-fill', 'active-gold');
                        } else {
                            s.classList.remove('bi-star-fill', 'active-gold');
                            s.classList.add('bi-star');
                        }
                    });
                });
            });
        });
    }
});
