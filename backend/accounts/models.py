from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    favorite_genres = models.ManyToManyField('movies.Genre', related_name="favorited_by_users", blank=True, verbose_name="Genres favoris")
    favorite_themes = models.TextField(verbose_name="Thèmes favoris", blank=True, help_text="Séparez les thèmes par des virgules")
    history = models.ManyToManyField('movies.Movie', related_name="watched_by", blank=True, verbose_name="Historique des films vus")
    favorite_movies = models.ManyToManyField('movies.Movie', related_name="favorited_by", blank=True, verbose_name="Films favoris")

    class Meta:
        verbose_name = "Profil Utilisateur"

    def __str__(self):
        return f"Profil de {self.user.username}"

# Signaux pour créer et sauvegarder automatiquement un Profile à la création d'un User
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
