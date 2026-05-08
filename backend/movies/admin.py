from django.contrib import admin
from django.db.models import Avg
from .models import Genre, Movie, Review

@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    # Ajout du système interactif list_editable pour "Mettre en Avant" sans ouvrir la page form
    list_display = ('title', 'director', 'year', 'get_average_rating', 'is_featured')
    search_fields = ('title', 'director', 'actors')
    list_filter = ('is_featured', 'year', 'genres')
    list_editable = ('is_featured',)
    filter_horizontal = ('genres',)
    
    # Organisation avancée du formulaire par onglets/sections
    fieldsets = (
        ('Informations Générales', {
            'fields': ('title', 'synopsis', 'is_featured')
        }),
        ('Staff & Technique', {
            'fields': ('director', 'actors', 'country', 'duration', 'release_date', 'year')
        }),
        ('Classification', {
            'fields': ('genres',)
        }),
    )

    # Statistiques Globales : calcul de note moyenne (Trends)
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.annotate(average_rating=Avg('reviews__rating'))

    def get_average_rating(self, obj):
        avg = getattr(obj, 'average_rating', None)
        return f"{avg:.1f} / 5" if avg else "Aucune note"
    
    get_average_rating.short_description = "Note Moyenne"
    get_average_rating.admin_order_field = 'average_rating'

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    # Aperçus textes directement dans la page liste pour modération simplifiée
    list_display = ('user', 'movie', 'rating', 'status', 'created_at', 'text_excerpt')
    list_filter = ('status', 'rating', 'created_at')
    search_fields = ('user__username', 'movie__title', 'text')
    actions = ['reset_usefulness'] # Les administrateurs peuvent aussi supprimer (par défaut via Django)
    
    def text_excerpt(self, obj):
        return obj.text[:60] + '...' if len(obj.text) > 60 else obj.text
    text_excerpt.short_description = "Aperçu (Modération)"

    @admin.action(description="Réinitialiser les votes d'utilité")
    def reset_usefulness(self, request, queryset):
        rows = queryset.update(useful_count=0, not_useful_count=0)
        self.message_user(request, f"{rows} critiques ont été réinitialisées.")
