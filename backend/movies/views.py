from django.shortcuts import render, get_object_or_404, redirect
from django.contrib import messages
from .models import Movie, Genre, Review
from .forms import ReviewForm

def movie_list(request):
    movies = Movie.objects.all().order_by('-year', 'title')
    genres = Genre.objects.all().order_by('name')
    
    years = Movie.objects.values_list('year', flat=True).distinct().order_by('-year')
    countries = Movie.objects.values_list('country', flat=True).distinct().order_by('country')

    search_query = request.GET.get('q')
    genre_query = request.GET.get('genre')
    year_query = request.GET.get('year')
    country_query = request.GET.get('country')
    catalog_query = request.GET.get('catalog')

    is_filtering = any([search_query, genre_query, year_query, country_query, catalog_query])

    if search_query:
        movies = movies.filter(title__icontains=search_query)
    if genre_query:
        movies = movies.filter(genres__id=genre_query)
    if year_query:
        movies = movies.filter(year=year_query)
    if country_query:
        movies = movies.filter(country=country_query)

    clean_years = [y for y in years if y is not None]
    clean_countries = [c for c in countries if c and c != 'Inconnu']

    # --- Algorithme de Découverte & Recommandation ---
    suggestions = None
    similar_movies = None
    trends = None
    featured_movies = None

    if not is_filtering:
        # Extraire les films "Mis en avant" (Séléction manuelle par l'administrateur)
        featured_movies = Movie.objects.filter(is_featured=True).order_by('-year')

        if request.user.is_authenticated:
            try:
                user_favorite_genres = request.user.profile.favorite_genres.all()
                if user_favorite_genres.exists():
                    suggestions = Movie.objects.filter(genres__in=user_favorite_genres).distinct().exclude(reviews__user=request.user).order_by('?')[:4]
            except Exception:
                pass
            
            liked_movies = Movie.objects.filter(reviews__user=request.user, reviews__rating__gte=4)
            if liked_movies.exists():
                liked_genres = Genre.objects.filter(movies__in=liked_movies).distinct()
                similar_movies_query = Movie.objects.filter(genres__in=liked_genres).distinct().exclude(reviews__user=request.user)
                if suggestions:
                    similar_movies_query = similar_movies_query.exclude(id__in=suggestions.values_list('id', flat=True))
                similar_movies = similar_movies_query.order_by('?')[:4]

            trends_query = Movie.objects.all()
            if suggestions: trends_query = trends_query.exclude(id__in=suggestions.values_list('id', flat=True))
            if similar_movies: trends_query = trends_query.exclude(id__in=similar_movies.values_list('id', flat=True))
            if featured_movies: trends_query = trends_query.exclude(id__in=featured_movies.values_list('id', flat=True))
            trends = trends_query.order_by('-year', '?')[:4]
        else:
            trends_query = Movie.objects.all()
            if featured_movies: trends_query = trends_query.exclude(id__in=featured_movies.values_list('id', flat=True))
            trends = trends_query.order_by('-year', '?')[:8]
            
        movies = movies[:12]

    context = {
        'movies': movies,
        'genres': genres,
        'years': clean_years,
        'countries': clean_countries,
        'is_filtering': is_filtering,
        'suggestions': suggestions,
        'similar_movies': similar_movies,
        'trends': trends,
        'featured_movies': featured_movies,
    }
    return render(request, 'movies/movie_list.html', context)

def movie_detail(request, pk):
    movie = get_object_or_404(Movie, pk=pk)
    reviews = movie.reviews.all().order_by('-created_at')
    
    review_form = None
    if request.user.is_authenticated:
        user_review = Review.objects.filter(movie=movie, user=request.user).first()
        
        if request.method == 'POST':
            review_form = ReviewForm(request.POST, instance=user_review)
            if review_form.is_valid():
                rev = review_form.save(commit=False)
                rev.user = request.user
                rev.movie = movie
                rev.save()
                messages.success(request, "Merci ! Votre critique a bien été enregistrée.")
                return redirect('movie_detail', pk=movie.pk)
        else:
            review_form = ReviewForm(instance=user_review)
            
    context = {
        'movie': movie,
        'reviews': reviews,
        'review_form': review_form,
    }
    return render(request, 'movies/movie_detail.html', context)
