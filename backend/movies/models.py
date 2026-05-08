from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class Genre(models.Model):
    name = models.CharField(max_length=50, unique=True, verbose_name="Nom du genre")

    def __str__(self):
        return self.name

class Movie(models.Model):
    title = models.CharField(max_length=255, verbose_name="Titre")
    director = models.CharField(max_length=255, verbose_name="Réalisateur")
    actors = models.TextField(verbose_name="Acteurs", help_text="Indiquer les acteurs, séparés par des virgules")
    synopsis = models.TextField(verbose_name="Synopsis")
    release_date = models.DateField(verbose_name="Date de sortie exacte", null=True, blank=True)
    duration = models.PositiveIntegerField(verbose_name="Durée (en minutes)")
    genres = models.ManyToManyField(Genre, related_name="movies", verbose_name="Genres")
    country = models.CharField(max_length=100, verbose_name="Pays de production")
    year = models.PositiveIntegerField(verbose_name="Année de sortie", null=True, blank=True)
    is_featured = models.BooleanField(default=False, verbose_name="Mettre en avant sur l'accueil")

    def __str__(self):
        return f"{self.title} ({self.year})"

class Review(models.Model):
    STATUS_CHOICES = [
        ('vu', 'Vu'),
        ('a_voir', 'À voir'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="reviews", verbose_name="Utilisateur")
    movie = models.ForeignKey(Movie, on_delete=models.CASCADE, related_name="reviews", verbose_name="Film")
    rating = models.PositiveIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)],
        verbose_name="Note sur 5 étoiles",
        null=True, blank=True
    )
    text = models.TextField(verbose_name="Critique", blank=True)
    useful_count = models.PositiveIntegerField(default=0, verbose_name="Utile")
    not_useful_count = models.PositiveIntegerField(default=0, verbose_name="Pas utile")
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='vu', verbose_name="Statut")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Critique / Interaction"
        unique_together = ('user', 'movie')

    def __str__(self):
        return f"{self.user.username} - {self.movie.title}"
