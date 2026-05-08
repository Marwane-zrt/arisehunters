import os
import sys
import requests
from pathlib import Path

# Configurer l'environnement Django
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'arisehunter.settings')

import django
django.setup()

from movies.models import Movie, Genre

# Remplacez par votre propre clé d'API TMDB !!
TMDB_API_KEY = os.environ.get('TMDB_API_KEY', 'b0bd57b6f6d63428d8442fae3dd9810a') 

def fetch_and_save_movies(pages=2):
    print("🎬 Récupération des genres...")
    genre_mapping = {}
    r_genres = requests.get(f"https://api.themoviedb.org/3/genre/movie/list?api_key={TMDB_API_KEY}&language=fr-FR")
    if r_genres.status_code == 200:
        for g in r_genres.json().get('genres', []):
            genre_obj, _ = Genre.objects.get_or_create(name=g['name'])
            genre_mapping[g['id']] = genre_obj
    else:
        print("❌ Erreur de récupération des genres (Clé API peut-être invalide ?)")
        return

    print(f"🎬 Début de l'importation de films (Pages: {pages})...")
    for page in range(1, pages + 1):
        url = f"https://api.themoviedb.org/3/movie/popular?api_key={TMDB_API_KEY}&language=fr-FR&page={page}"
        response = requests.get(url)
        
        if response.status_code == 200:
            movies_data = response.json().get('results', [])
            for m in movies_data:
                # Récupère les détails avancés (acteurs, réal, durée, pays)
                detail_url = f"https://api.themoviedb.org/3/movie/{m['id']}?api_key={TMDB_API_KEY}&language=fr-FR&append_to_response=credits"
                d_resp = requests.get(detail_url)
                if d_resp.status_code != 200:
                    continue
                
                d_data = d_resp.json()

                # Gérer l'équipe (Réalisateur)
                crew = d_data.get('credits', {}).get('crew', [])
                director = next((c['name'] for c in crew if c['job'] == 'Director'), 'Inconnu')
                
                # Gérer le casting (Top 5 acteurs)
                cast = d_data.get('credits', {}).get('cast', [])
                top_actors = ", ".join([c['name'] for c in cast[:5]])

                # Pays
                countries = d_data.get('production_countries', [])
                country = countries[0]['name'] if countries else 'Inconnu'
                
                # Année
                year = None
                release_date = d_data.get('release_date')
                if release_date:
                    try:
                        year = int(release_date.split('-')[0])
                    except ValueError:
                        pass
                else:
                    release_date = None
                
                # Insertion si inexistant
                movie_obj, created = Movie.objects.get_or_create(
                    title=m.get('title', 'Sans Titre'),
                    defaults={
                        'director': director,
                        'actors': top_actors,
                        'synopsis': m.get('overview', ''),
                        'release_date': release_date,
                        'duration': d_data.get('runtime') or 0,
                        'country': country,
                        'year': year,
                    }
                )
                
                if created:
                    # Associer les genres via les ID TMDB stockés
                    for gid in m.get('genre_ids', []):
                        if gid in genre_mapping:
                            movie_obj.genres.add(genre_mapping[gid])
                    print(f"✅ Ajouté : {movie_obj.title} ({year})")
                else:
                    print(f"⚠️ Déjà existant : {movie_obj.title}")
        else:
            print(f"❌ Erreur sur la requête API TMDB (Page {page}) - Code: {response.status_code}")
            
    print("🎉 Importation terminée !")

if __name__ == "__main__":
    fetch_and_save_movies(1) # Récupère la première page (20 films les plus populaires)
